import { useState } from "react";
import { Shield, CheckCircle2, Loader2 } from "lucide-react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../hooks/useAuth";
import { logAudit, logActivity, dispatchDomainEvent } from "../services/governanceService";

interface SecureNDAProps {
  projectId: string;
  projectTitle: string;
  onAccept: () => void;
}

export function SecureNDA({ projectId, projectTitle, onAccept }: SecureNDAProps) {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Registrar o aceite do investidor (Clickwrap) na colecao correta e com ID previsivel
      const ndaId = `${user.uid}_${projectId}`;
      await setDoc(doc(db, 'signed_ndas', ndaId), {
        projectId,
        projectTitle,
        investorId: user.uid,
        investorName: user.displayName || user.email || "Investidor",
        investorEmail: user.email || "",
        acceptedAt: serverTimestamp(),
        signedAt: serverTimestamp(), // Compatibilidade com ndaService
        status: 'active',
        version: "1.0-smart-clickwrap"
      });
      
      // Registrar na Governança
      const actor = {
        uid: user.uid,
        name: user.displayName || user.email || "Investidor",
        email: user.email || "",
        role: userProfile?.role || "investor"
      };

      await logAudit(
        actor,
        "nda.signed",
        projectId,
        projectTitle,
        null,
        { status: "active", version: "1.0-smart-clickwrap" }
      );

      await logActivity(
        "nda.signed",
        actor.name,
        projectId,
        projectTitle,
        { investorId: user.uid }
      );

      await dispatchDomainEvent("nda.signed", {
        investorId: user.uid,
        projectId,
        projectTitle
      });

      setAccepted(true);
      setTimeout(onAccept, 1500); // Dar tempo para ver o check
    } catch (error) {
      console.error("Falha ao registrar NDA", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md rounded-3xl">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            {accepted ? <CheckCircle2 size={32} className="text-emerald-400" /> : <Shield size={32} />}
          </div>
          
          <h3 className="text-xl font-bold text-white">Acesso Restrito ao VDR</h3>
          <p className="text-slate-400 text-sm">
            Este projeto contém informações confidenciais. Para acessar os documentos do Virtual Data Room, você deve aceitar os termos de confidencialidade (NDA).
          </p>
          
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-left space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 mt-1 shrink-0" />
              <p className="text-xs text-slate-400">Compromisso de não divulgar informações técnicas.</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 mt-1 shrink-0" />
              <p className="text-xs text-slate-400">Uso exclusivo para fins de avaliação de negócio.</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 mt-1 shrink-0" />
              <p className="text-xs text-slate-400">Validade jurídica via registro de timestamp e ID.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={handleAccept}
              disabled={loading || accepted}
              className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                accepted 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                accepted ? "Acesso Autorizado" : "Aceitar NDA e Ver VDR"
              )}
            </button>
            <p className="text-[10px] text-slate-600">
              Ao clicar, você concorda com os termos padrão de confidencialidade da plataforma Orizon Match.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
