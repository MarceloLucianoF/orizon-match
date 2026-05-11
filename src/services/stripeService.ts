import { auth } from "../firebase/config";

export async function createStripeCheckout(priceId: string) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    const response = await fetch('https://southamerica-east1-orizon-match.cloudfunctions.net/createCheckoutSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          priceId,
          userId: user.uid,
          email: user.email
        }
      })
    });

    if (!response.ok) throw new Error("Erro ao criar sessão de checkout.");
    
    const result = await response.json();
    const { url } = result.data as { url: string };
    
    if (url) {
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
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    const response = await fetch('https://southamerica-east1-orizon-match.cloudfunctions.net/createPortalSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: { userId: user.uid }
      })
    });

    if (!response.ok) throw new Error("Erro ao abrir portal do cliente.");
    
    const result = await response.json();
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
