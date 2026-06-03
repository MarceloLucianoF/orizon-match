"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSession = createCheckoutSession;
exports.createPortalSession = createPortalSession;
exports.handleWebhook = handleWebhook;
const stripe_1 = __importDefault(require("stripe"));
const admin = __importStar(require("firebase-admin"));
// A chave virá do Secret Manager do Firebase
const getStripe = () => {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey)
        throw new Error("STRIPE_SECRET_KEY not configured");
    return new stripe_1.default(apiKey);
};
const db = admin.firestore();
async function createCheckoutSession(userId, email, priceId) {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
        // Removido payment_method_types para usar as configurações automáticas do Dashboard do Stripe
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: `https://orizon-match.web.app/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://orizon-match.web.app/pricing`,
        customer_email: email,
        metadata: {
            userId,
        },
    });
    return { sessionId: session.id, url: session.url };
}
async function createPortalSession(userId) {
    const stripe = getStripe();
    // Buscar o stripeCustomerId no Firestore
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();
    const customerId = userData === null || userData === void 0 ? void 0 : userData.stripeCustomerId;
    if (!customerId) {
        throw new Error("Usuário não possui um Customer ID do Stripe.");
    }
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: 'https://orizon-match.web.app/billing',
    });
    return { url: session.url };
}
async function handleWebhook(body, signature) {
    var _a;
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error("STRIPE_WEBHOOK_SECRET not configured");
        throw new Error("Webhook secret not configured");
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
    catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        throw new Error(`Webhook Error: ${err.message}`);
    }
    // Pre-resolve the userId outside of the transaction block to avoid querying inside the transaction.
    let userId = null;
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        userId = ((_a = session.metadata) === null || _a === void 0 ? void 0 : _a.userId) || null;
    }
    else if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        if (customerId) {
            const userQuery = await db.collection("users").where("stripeCustomerId", "==", customerId).limit(1).get();
            if (!userQuery.empty) {
                userId = userQuery.docs[0].id;
            }
        }
    }
    else if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        if (customerId) {
            const userQuery = await db.collection("users").where("stripeCustomerId", "==", customerId).limit(1).get();
            if (!userQuery.empty) {
                userId = userQuery.docs[0].id;
            }
        }
    }
    console.log(`[STRIPE WEBHOOK] Resolved userId: ${userId} for event ${event.id} of type ${event.type}`);
    const eventRef = db.collection("billing_events").doc(event.id);
    // Wrap all state changes and logging inside a Firestore transaction.
    const result = await db.runTransaction(async (transaction) => {
        // 1. Idempotency Check: Avoid processing duplicate events
        const eventDoc = await transaction.get(eventRef);
        if (eventDoc.exists) {
            console.log(`[STRIPE WEBHOOK] Event ${event.id} already processed.`);
            return { received: true, duplicate: true };
        }
        let userRef = null;
        let userData = null;
        if (userId) {
            userRef = db.collection("users").doc(userId);
            const userDoc = await transaction.get(userRef);
            if (userDoc.exists) {
                userData = userDoc.data();
            }
        }
        // 2. Timestamp check for out-of-order deliveries
        if (userData && userData.lastStripeEventCreated !== undefined) {
            if (event.created <= userData.lastStripeEventCreated) {
                console.log(`[STRIPE WEBHOOK] Out-of-order event ${event.id} ignored. Incoming timestamp: ${event.created}, last processed: ${userData.lastStripeEventCreated}`);
                // Write to billing_events to ensure we don't process this specific event again
                transaction.set(eventRef, {
                    eventId: event.id,
                    type: event.type,
                    created: event.created,
                    processedAt: admin.firestore.FieldValue.serverTimestamp(),
                    livemode: event.livemode,
                    status: 'ignored_older_timestamp',
                    userId: userId || null
                });
                return { received: true, ignored: true };
            }
        }
        // 3. Process Subscription Changes
        const userUpdates = {
            lastStripeEventCreated: event.created,
            lastStripeEventId: event.id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            subscriptionVersion: admin.firestore.FieldValue.increment(1)
        };
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            userUpdates.subscriptionStatus = 'premium';
            userUpdates.stripeCustomerId = session.customer;
            userUpdates.subscriptionId = session.subscription;
            console.log(`[STRIPE WEBHOOK] User ${userId} upgrade to premium. Customer: ${session.customer}`);
        }
        else if (event.type === 'invoice.payment_succeeded') {
            userUpdates.subscriptionStatus = 'premium';
            userUpdates.lastPaymentStatus = 'succeeded';
            console.log(`[STRIPE WEBHOOK] Recurring payment succeeded for user ${userId}`);
        }
        else if (event.type === 'customer.subscription.deleted') {
            userUpdates.subscriptionStatus = 'free';
            userUpdates.subscriptionId = null;
            console.log(`[STRIPE WEBHOOK] Subscription deleted for user ${userId}. Downgraded to free.`);
        }
        // Execute User updates in transaction
        if (userRef && userData) {
            transaction.update(userRef, userUpdates);
        }
        // Log the event under billing_events in transaction
        transaction.set(eventRef, {
            eventId: event.id,
            type: event.type,
            created: event.created,
            processedAt: admin.firestore.FieldValue.serverTimestamp(),
            livemode: event.livemode,
            status: 'processed',
            userId: userId || null
        });
        return { received: true };
    });
    return result;
}
//# sourceMappingURL=stripe.service.js.map