import { useAuth } from "../../hooks/useAuth";
import { 
  CreditCard, Calendar, CheckCircle2, 
  ArrowUpCircle, ExternalLink, ShieldCheck,
  Receipt, Download, Zap, Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { openCustomerPortal } from "../../services/stripeService";
import { useState } from "react";

export function Billing() {
  const { userProfile } = useAuth();
  
  const isPremium = userProfile?.subscriptionStatus === 'premium';
  const planName = userProfile?.plan === 'pro' ? 'InovaHelix Pro' : (userProfile?.plan === 'enterprise' ? 'Enterprise' : 'InovaHelix Free');
  const [loading, setLoading] = useState(false);

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      await openCustomerPortal();
    } catch (e) {
      alert("Erro ao abrir portal de faturamento. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  // MOCK de faturas
  const mockInvoices = [
    { id: 'INV-001', date: '10/05/2026', amount: 'R$ 197,00', status: 'pago' },
    { id: 'INV-002', date: '10/04/2026', amount: 'R$ 197,00', status: 'pago' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <CreditCard className="text-teal-400" /> Assinatura e Faturamento
        </h1>
        <p className="text-slate-400 mt-1 text-sm md:text-base">Gerencie seu plano, faturas e métodos de pagamento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card do Plano Atual */}
        <div className="md:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 md:p-8 relative overflow-hidden group shadow-card backdrop-blur-sm">
          <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-20 transition-all duration-500 ${isPremium ? 'bg-teal-500 group-hover:scale-150' : 'bg-slate-500'}`} />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 bg-teal-500/10 px-2 py-1 rounded border border-teal-500/20">Seu Plano Atual</span>
                <h2 className="text-3xl font-black text-white mt-4 tracking-tight">{planName}</h2>
              </div>
              {isPremium && (
                <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <ShieldCheck size={24} />
                </div>
              )}
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span>{isPremium ? 'Acesso ilimitado ao Radar Pro' : 'Acesso limitado ao ecossistema'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span>{isPremium ? 'Inteligência Geoespacial Ativa' : 'Matches básicos de IA'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span>Suporte prioritário 24/7</span>
              </div>
            </div>

            <div className="mt-auto pt-8 flex flex-col sm:flex-row gap-4">
              {!isPremium ? (
                <Link 
                  to="/pricing"
                  className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,181,156,0.3)]"
                >
                  <ArrowUpCircle size={18} /> Fazer Upgrade Agora
                </Link>
              ) : (
                <button 
                  onClick={handleManageBilling}
                  disabled={loading}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-700 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <><ExternalLink size={18} /> Gerenciar no Stripe</>}
                </button>
              )}
              <p className="text-[10px] text-slate-500 flex items-center justify-center text-center px-4">
                Ambiente seguro processado pelo Stripe.
              </p>
            </div>
          </div>
        </div>

        {/* Detalhes de Próximo Pagamento */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col shadow-card backdrop-blur-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Próximo Vencimento</h3>
          
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-2">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 mb-2 shadow-inner">
              <Calendar size={32} className="text-slate-400" />
            </div>
            <p className="text-2xl font-black text-white">{isPremium ? '10 Jun 2026' : '--'}</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{isPremium ? 'Cobrança Mensal' : 'Sem cobranças ativas'}</p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-[10px] text-slate-500">
            Cartão final ** 4242
          </div>
        </div>
      </div>

      {/* Histórico de Faturas */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl overflow-hidden shadow-card backdrop-blur-sm">
        <div className="p-6 border-b border-slate-800 bg-slate-900/10 flex justify-between items-center">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-200 flex items-center gap-2">
            <Receipt className="text-teal-400" size={18} /> Histórico de Faturas
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 bg-slate-900/50">
                <th className="p-4 font-bold">Fatura</th>
                <th className="p-4 font-bold">Data</th>
                <th className="p-4 font-bold">Valor</th>
                <th className="p-4 font-bold text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {!isPremium ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 italic text-sm">
                    Você ainda não possui faturas. Comece sua assinatura Pro para visualizá-las aqui.
                  </td>
                </tr>
              ) : (
                mockInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                          <CheckCircle2 size={14} className="text-emerald-500" />
                        </div>
                        <span className="text-sm font-bold text-slate-200">{inv.id}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-400">{inv.date}</td>
                    <td className="p-4 text-sm font-bold text-white">{inv.amount}</td>
                    <td className="p-4 text-right">
                      <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-teal-400 transition-all">
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Showcase Mode Badge */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4">
        <Zap className="text-amber-500 flex-shrink-0" size={24} />
        <div>
          <p className="text-sm font-bold text-amber-200">Showcase Mode Ativo</p>
          <p className="text-[10px] text-amber-400 uppercase tracking-widest font-black">Você pode testar o fluxo de pagamento com o cartão de teste do Stripe.</p>
        </div>
      </div>
    </div>
  );
}
