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

  // 1. Idempotency Check: Evitar processar evento duplicado
  const eventRef = db.collection("billing_events").doc(event.id);
  const eventDoc = await eventRef.get();
  if (eventDoc.exists) {
    console.log(`[STRIPE WEBHOOK] Event ${event.id} already processed.`);
    return { received: true, duplicate: true };
  }

  // 2. Auditoria e Logs: Salvar evento de faturamento antes do processamento
  await eventRef.set({
    eventId: event.id,
    type: event.type,
    created: event.created,
    processedAt: admin.firestore.FieldValue.serverTimestamp(),
    livemode: event.livemode,
  });

  // 3. Processamento de Eventos Core
  console.log(`[STRIPE WEBHOOK] Processing event ${event.id} of type ${event.type}`);

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
      console.log(`[STRIPE WEBHOOK] User ${userId} upgraded to premium. Customer: ${session.customer}`);
    }
  } 
  else if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as any;
    const customerId = invoice.customer;

    if (customerId) {
      const userQuery = await db.collection("users").where("stripeCustomerId", "==", customerId).get();
      if (!userQuery.empty) {
        const userDocRef = userQuery.docs[0].ref;
        await userDocRef.update({
          subscriptionStatus: 'premium',
          lastPaymentStatus: 'succeeded',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`[STRIPE WEBHOOK] Recurring payment succeeded for customer ${customerId}`);
      }
    }
  } 
  else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any;
    const customerId = subscription.customer;

    if (customerId) {
      const userQuery = await db.collection("users").where("stripeCustomerId", "==", customerId).get();
      if (!userQuery.empty) {
        const userDocRef = userQuery.docs[0].ref;
        await userDocRef.update({
          subscriptionStatus: 'free',
          subscriptionId: null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`[STRIPE WEBHOOK] Subscription deleted for customer ${customerId}. Downgraded to free.`);
      }
    }
  }

  return { received: true };
}
