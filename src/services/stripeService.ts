import { functions } from "../firebase/config";
import { httpsCallable } from "firebase/functions";

export async function createStripeCheckout(priceId: string) {
  try {
    const createSessionFn = httpsCallable(functions, 'createCheckoutSession');
    const result = await createSessionFn({ priceId });
    
    const { url } = result.data as { url: string };
    
    if (url) {
      // Redireciona o usuário para o Checkout do Stripe
      window.location.href = url;
    } else {
      throw new Error("URL de checkout não retornada.");
    }
  } catch (error) {
    console.error("Erro ao iniciar checkout:", error);
    throw error;
  }
}

export async function openCustomerPortal() {
  try {
    const createPortalFn = httpsCallable(functions, 'createPortalSession');
    const result = await createPortalFn();
    const { url } = result.data as { url: string };
    
    if (url) {
      window.location.href = url;
    } else {
      throw new Error("URL do portal não retornada.");
    }
  } catch (error) {
    console.error("Erro ao abrir portal do cliente:", error);
    throw error;
  }
}
