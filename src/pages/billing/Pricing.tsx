import { useState } from 'react';
import { 
  Check, 
  Zap, 
  Star, 
  Rocket, 
  ArrowRight, 
  Loader2,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { functions } from "../../firebase/config";
import { httpsCallable } from "firebase/functions";
import { useAuth } from '../../hooks/useAuth';

const PLANS = [
  {
    id: 'free',
    name: 'Starter',
    price: '0',
    description: 'Para quem está começando a validar ideias.',
    features: [
      'Visualização de 3 matches/mês',
      'Perfil básico de pesquisador',
      'Preview de afinidade IA',
      'Acesso ao dashboard básico'
    ],
    buttonText: 'Plano Atual',
    premium: false
  },
  {
    id: 'pro',
    name: 'Orizon Pro',
    price: '197',
    description: 'Acesso total ao ecossistema de inovação.',
    features: [
      'Matches ilimitados (AI Multi-Factor)',
      'Acesso direto aos contatos (Empresas/ICTs)',
      'Orizon Advisor (Chat IA Contextual)',
      'Dashboard de métricas avançado',
      'Selo de Verificação Orizon',
      'Prioridade em novos matches'
    ],
    buttonText: 'Assinar Agora',
    premium: true,
    highlight: true,
    priceId: 'price_1TVPrI44i38VVUUzGbTXJkzB' // ID real do Stripe do usuário
  }
];

export default function Pricing() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      navigate('/onboarding');
      return;
    }

    setLoading(priceId);
    try {
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const result = await createCheckoutSession({ priceId });
      const { url } = result.data as { url: string };
      
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error("Erro ao iniciar checkout:", err);
      alert("Erro ao iniciar processo de pagamento. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 py-20 px-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
            <Zap size={12} /> Planos & Preços
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Acelere sua Inovação no <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Orizon Match</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Escolha o plano ideal para conectar sua ideia ao mercado ou encontrar tecnologias disruptivas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={`relative p-8 rounded-3xl border transition-all duration-500 ${
                plan.highlight 
                ? 'bg-slate-900/80 border-indigo-500/50 shadow-[0_0_40px_rgba(79,70,229,0.15)] scale-105 z-20' 
                : 'bg-slate-900/40 border-slate-800 scale-100 z-10 grayscale hover:grayscale-0'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Mais Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    {plan.premium ? <Star className="text-amber-400 fill-amber-400" size={24} /> : <Rocket className="text-indigo-400" size={24} />}
                    {plan.name}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">R$ {plan.price}</span>
                  <span className="text-slate-500 font-medium">/mês</span>
                </div>

                <div className="space-y-4 pt-4">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 group">
                      <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.highlight ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                        <Check size={12} />
                      </div>
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  disabled={loading !== null || (plan.id === 'free' && !userProfile?.subscriptionStatus) || userProfile?.subscriptionStatus === 'premium'}
                  onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
                  className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    plan.highlight
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]'
                    : 'bg-slate-800 text-slate-400 cursor-default'
                  }`}
                >
                  {loading === plan.priceId ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      {plan.buttonText} <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <Shield className="text-emerald-500" size={24} />
            <div className="text-left">
              <p className="text-white text-sm font-bold">Pagamento 100% Seguro</p>
              <p className="text-slate-500 text-xs">Processado via Stripe com criptografia SSL.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
