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
import { useAuth } from '../../hooks/useAuth';

const INVENTOR_PLANS = [
  {
    id: 'free',
    name: 'Starter',
    price: '0',
    description: 'Para inventores validarem suas ideias iniciais.',
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
    id: 'pro_inventor',
    name: 'Pro Inventor',
    price: '49',
    description: 'Ferramentas de IA para otimização de pitches e VDR Room.',
    features: [
      'Matches ilimitados (AI Multi-Factor)',
      'Orizon Advisor (Chat IA Contextual)',
      'Pitch enhancer IA',
      'VDR Room ilimitado',
      'Destaque básico no Radar'
    ],
    buttonText: 'Assinar Agora',
    premium: true,
    highlight: true,
    priceId: 'price_1TVPrI44i38VVUUzGbTXJkzB' // ID real do Stripe do usuário para teste sandbox
  },
  {
    id: 'premium_expert',
    name: 'Premium Expert',
    price: '129',
    description: 'Suporte especializado para certificação de TRL e prioridade máxima.',
    features: [
      'Suporte para certificação de TRL',
      'Prioridade máxima de matchmaking',
      'Assessoria jurídica integrada',
      'Destaque Gold no Radar de Inovação',
      'Análise de viabilidade por especialista'
    ],
    buttonText: 'Assinar Agora',
    premium: true,
    priceId: 'price_1TVPrI44i38VVUUzGbTXJkzB'
  }
];

const COMPANY_PLANS = [
  {
    id: 'ict_hub',
    name: 'ICT Hub',
    price: '299',
    description: 'Painel completo para NITS, ICTs e Universidades gerenciarem portfólio.',
    features: [
      'Gestão de portfólio completa',
      'Painel de Validação TRL',
      'Homologação de Laboratórios',
      'Vitrine Tecnológica integrada',
      'Acesso a até 5 gestores de NIT'
    ],
    buttonText: 'Assinar Agora',
    premium: true,
    priceId: 'price_1TVPrI44i38VVUUzGbTXJkzB'
  },
  {
    id: 'corporate_radar',
    name: 'Corporate Radar',
    price: '599',
    description: 'Para médias e grandes corporações mapearem inovações e gerenciarem deal flow.',
    features: [
      'Filtros Invstor.com avançados',
      'Mapeamento geográfico de ativos',
      'Radar de inovações Deep Tech',
      'Integração direta com inventores',
      'Pipeline Kanban customizável'
    ],
    buttonText: 'Assinar Agora',
    premium: true,
    highlight: true,
    priceId: 'price_1TVPrI44i38VVUUzGbTXJkzB'
  },
  {
    id: 'enterprise_synergy',
    name: 'Enterprise Synergy',
    price: '1499',
    description: 'Solução sob medida para Corporate Venture Capital e hubs de inovação aberta.',
    features: [
      'Dedicated Account Manager',
      'Relatórios SWOT automatizados por IA',
      'Acesso prioritário a patentes',
      'Customização completa de desafios',
      'Exportação de dados em lote (API)'
    ],
    buttonText: 'Assinar Agora',
    premium: true,
    priceId: 'price_1TVPrI44i38VVUUzGbTXJkzB'
  }
];

export default function Pricing() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'inventor' | 'company'>('inventor');

  const handleSubscribe = async (priceId: string, planId: string) => {
    if (!user) {
      navigate('/onboarding');
      return;
    }

    setLoading(planId);
    try {
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

      const result = await response.json();

      if (!response.ok) {
        console.error("Erro detalhado do servidor:", result.error);
        throw new Error(result.error?.message || "Erro interno no servidor de checkout.");
      }

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

  const activePlans = activeCategory === 'inventor' ? INVENTOR_PLANS : COMPANY_PLANS;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 py-20 px-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center space-y-4 mb-8">
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

        {/* Category Switcher Tabs */}
        <div className="flex justify-center mb-16">
          <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveCategory('inventor')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeCategory === 'inventor' 
                  ? 'bg-indigo-600 text-white shadow-xl border border-indigo-500/30' 
                  : 'text-slate-500 hover:text-slate-350'
              }`}
            >
              Para Inventores
            </button>
            <button
              onClick={() => setActiveCategory('company')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeCategory === 'company' 
                  ? 'bg-indigo-600 text-white shadow-xl border border-indigo-500/30' 
                  : 'text-slate-500 hover:text-slate-350'
              }`}
            >
              Para Empresas & ICTs
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {activePlans.map((plan) => {
            const isCurrentPlan = (plan.id === 'free' && !userProfile?.subscriptionStatus) ||
                                  (userProfile?.subscriptionStatus === 'premium' && plan.premium && plan.highlight);

            return (
              <div 
                key={plan.id}
                className={`relative p-8 rounded-3xl border transition-all duration-500 flex flex-col justify-between ${
                  plan.highlight 
                  ? 'bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-indigo-500/50 shadow-[0_20px_50px_rgba(99,102,241,0.15)] scale-105 z-20 hover:border-indigo-500 hover:shadow-[0_20px_60px_rgba(99,102,241,0.22)] hover:-translate-y-1' 
                  : 'bg-slate-900/40 border-slate-800/80 scale-100 z-10 hover:border-slate-700/80 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]'
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
                    <p className="text-slate-400 text-sm leading-relaxed min-h-[48px]">{plan.description}</p>
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
                </div>

                <div className="pt-8">
                  <button
                    disabled={loading !== null || isCurrentPlan || (plan.id === 'free' && userProfile?.subscriptionStatus)}
                    onClick={() => {
                      if (plan.id === 'free') return;
                      if (plan.priceId) handleSubscribe(plan.priceId, plan.id);
                    }}
                    className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      isCurrentPlan
                      ? 'bg-slate-800/80 text-slate-500 cursor-default'
                      : plan.highlight
                        ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] cursor-pointer'
                        : 'bg-slate-850 text-slate-300 hover:bg-slate-800 cursor-pointer border border-slate-700/50'
                    }`}
                  >
                    {loading === plan.id ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        {isCurrentPlan ? 'Plano Atual' : plan.buttonText} <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
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
