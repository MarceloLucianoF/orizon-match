import Stripe from 'stripe';
import * as admin from "firebase-admin";

// A chave virá do Secret Manager do Firebase
const getStripe = () => {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(apiKey);
};

const db = admin.firestore();

export async function createCheckoutSession(userId: string, email: string, priceId: string) {
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

export async function createPortalSession(userId: string) {
  const stripe = getStripe();
  
  // Buscar o stripeCustomerId no Firestore
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();
  const customerId = userData?.stripeCustomerId;

  if (!customerId) {
    throw new Error("Usuário não possui um Customer ID do Stripe.");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: 'https://orizon-match.web.app/billing',
  });

  return { url: session.url };
}

export async function handleWebhook(body: any, signature: string) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    throw new Error("Webhook secret not configured");
  }

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    throw new Error(`Webhook Error: ${err.message}`);
  }

  // Pre-resolve the userId outside of the transaction block to avoid querying inside the transaction.
  let userId: string | null = null;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    userId = session.metadata?.userId || null;
  } 
  else if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as any;
    const customerId = invoice.customer;
    if (customerId) {
      const userQuery = await db.collection("users").where("stripeCustomerId", "==", customerId).limit(1).get();
      if (!userQuery.empty) {
        userId = userQuery.docs[0].id;
      }
    }
  } 
  else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any;
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
    let userData: any = null;

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
    const userUpdates: any = {
      lastStripeEventCreated: event.created,
      lastStripeEventId: event.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      subscriptionVersion: admin.firestore.FieldValue.increment(1)
    };

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
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
