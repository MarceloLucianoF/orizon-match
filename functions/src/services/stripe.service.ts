import Stripe from 'stripe';
import * as admin from "firebase-admin";

// A chave virá do Secret Manager do Firebase
const getStripe = () => {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(apiKey, {
    apiVersion: '2025-01-27' as any,
  });
};

const db = admin.firestore();

export async function createCheckoutSession(userId: string, email: string, priceId: string) {
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

export async function handleWebhook(body: any, signature: string) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    throw new Error("Webhook secret not configured");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    throw new Error(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session.metadata?.userId;

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
