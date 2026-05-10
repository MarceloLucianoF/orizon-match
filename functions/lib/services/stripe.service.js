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
exports.handleWebhook = handleWebhook;
const stripe_1 = __importDefault(require("stripe"));
const admin = __importStar(require("firebase-admin"));
// A chave virá do Secret Manager do Firebase
const getStripe = () => {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey)
        throw new Error("STRIPE_SECRET_KEY not configured");
    return new stripe_1.default(apiKey, {
        apiVersion: '2025-01-27',
    });
};
const db = admin.firestore();
async function createCheckoutSession(userId, email, priceId) {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
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
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.userId;
        if (userId) {
            await db.collection("users").doc(userId).update({
                subscriptionStatus: 'premium',
                stripeCustomerId: session.customer,
                subscriptionId: session.subscription,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`User ${userId} upgraded to premium.`);
        }
    }
    return { received: true };
}
//# sourceMappingURL=stripe.service.js.map