import { useState } from "react";
import { 
  FileText, ShieldCheck, X, 
  CheckCircle, Loader2, Lock
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { signNDA } from "../../services/ndaService";

interface SmartNDAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSigned: () => void;
  project: any;
  linkedAssets: any[];
}

export function SmartNDAModal({ isOpen, onClose, onSigned, project, linkedAssets }: SmartNDAModalProps) {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  const handleSign = async () => {
    if (!user || !userProfile || !accepted) return;
    setLoading(true);
    try {
      await signNDA({
        investorId: user.uid,
        investorName: userProfile.name || user.email || "Investidor Anônimo",
        projectId: project.id,
        projectTitle: project.title,
        inventorId: project.userId,
        inventorName: project.ownerName || "Inventor Orizon",
        linkedAssets: linkedAssets.map(a => ({
          id: a.id,
          title: a.title,
          inpiNumber: a.inpiNumber
        }))
      });
      onSigned();
    } catch (e) {
      console.error(e);
      alert("Erro ao processar assinatura. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-indigo-500/20">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <ShieldCheck className="text-indigo-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Smart Clickwrap NDA</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Acordo de Confidencialidade Digital v1.0</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 md:p-10 text-slate-300 text-sm leading-relaxed font-serif space-y-6">
            <h4 className="text-center font-bold text-white text-base underline decoration-indigo-500 underline-offset-8 mb-8">
              ACORDO DE NÃO-DIVULGAÇÃO E SIGILO
            </h4>

            <p>
              Pelo presente instrumento, de um lado **{userProfile?.name || user?.email}** (doravante denominado "INVESTIDOR") e, de outro lado, o titular do projeto **"{project.title}"** (doravante denominado "INVENTOR"), resolvem celebrar este Acordo de Não-Divulgação ("NDA") sob as seguintes cláusulas:
            </p>

            <div className="space-y-4">
              <p>
                **1. OBJETO:** O presente acordo visa proteger as informações confidenciais relativas à tecnologia e modelo de negócio do projeto, incluindo, mas não se limitando aos seguintes ativos de Propriedade Intelectual:
              </p>
              <div className="pl-6 space-y-2 border-l-2 border-indigo-500/30 py-1">
                {linkedAssets.length > 0 ? linkedAssets.map((asset, i) => (
                  <p key={asset.id} className="text-slate-200">
                    {i+1}. {asset.title} {asset.inpiNumber ? `(Nº Processo: ${asset.inpiNumber})` : '(Documentação em fase de depósito)'}
                  </p>
                )) : (
                  <p className="text-slate-400 italic">Nenhum ativo formal vinculado. A proteção abrange todo o material contido no VDR.</p>
                )}
              </div>
            </div>

            <p>
              **2. OBRIGAÇÕES:** O INVESTIDOR compromete-se a utilizar as informações recebidas exclusivamente para fins de avaliação de investimento, abstendo-se de copiar, reproduzir ou utilizar tais informações em benefício próprio ou de terceiros sem autorização expressa.
            </p>

            <p>
              **3. PRAZO:** A obrigação de sigilo permanecerá em vigor pelo prazo de 5 (cinco) anos a contar da presente data, ou até que tais informações tornem-se de domínio público sem culpa do INVESTIDOR.
            </p>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex gap-4 items-start font-sans">
               <Lock className="text-indigo-400 shrink-0" size={18} />
               <p className="text-[10px] text-slate-500 leading-tight">
                 Este documento é gerado dinamicamente e assinado eletronicamente via Smart Clickwrap. O registro desta transação (IP, Timestamp e Snapshot de Ativos) é armazenado em banco de dados imutável para fins de auditoria jurídica.
               </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="peer hidden" 
                  checked={accepted}
                  onChange={() => setAccepted(!accepted)}
                />
                <div className="w-6 h-6 rounded-lg border-2 border-slate-700 bg-slate-950 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center">
                   <CheckCircle className={`text-white transition-all ${accepted ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} size={16} />
                </div>
              </div>
              <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                Declaro que li e aceito os termos do Acordo de Não-Divulgação.
              </span>
            </label>

            <button 
              onClick={handleSign}
              disabled={!accepted || loading}
              className="w-full md:w-auto ml-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all disabled:opacity-30 disabled:grayscale"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>Assinar e Liberar VDR <FileText size={18} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
