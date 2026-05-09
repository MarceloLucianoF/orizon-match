import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { 
  User, Building2, Mail, Phone, 
  ShieldCheck, Bell, Save, Loader2,
  CheckCircle2, CreditCard
} from "lucide-react";

export function Profile() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    phone: "",
    bio: "",
    companyName: ""
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        idNumber: userProfile.idNumber || "",
        phone: userProfile.phone || "",
        bio: userProfile.bio || "",
        companyName: userProfile.companyName || ""
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <User className="text-indigo-400" /> Perfil e Configurações
        </h1>
        <p className="text-slate-400 mt-1">Gerencie suas informações cadastrais e preferências da conta.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-4">Dados Pessoais / Corporativos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 block">Nome Completo / Responsável</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 block">CPF / CNPJ</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    type="text" 
                    value={formData.idNumber}
                    onChange={e => setFormData({...formData, idNumber: e.target.value})}
                    placeholder="000.000.000-00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 block">Telefone de Contato</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 block">E-mail (Login)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    type="email" 
                    value={user?.email || ""} 
                    disabled 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="col-span-full space-y-2">
                <label className="text-sm font-medium text-slate-400 block">Biografia / Sobre a Empresa</label>
                <textarea 
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-all resize-none"
                  placeholder="Conte um pouco sobre sua atuação no mercado de inovação..."
                />
                <p className="text-xs text-slate-500">
                  <strong>Importância da Proteção:</strong> Proteger sua ideia evita cópias e atrai investimentos sérios.
                </p>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : success ? <CheckCircle2 size={20} /> : <Save size={20} />}
                {success ? "Salvo!" : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-slate-200 mb-6 uppercase tracking-widest">Status da Conta</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${userProfile?.verified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                <ShieldCheck size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">{userProfile?.verified ? 'Perfil Verificado' : 'Aguardando Verificação'}</p>
                <p className="text-[10px] text-slate-500">{userProfile?.verified ? 'Seus dados foram auditados pelo Orizon' : 'Complete seu perfil para auditoria'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 flex items-center gap-2"><Building2 size={14} /> Role</span>
                  <span className="text-xs font-bold text-indigo-400 uppercase">{userProfile?.role}</span>
               </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-slate-200 mb-6 uppercase tracking-widest">Preferências</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 flex items-center gap-2"><Bell size={14} /> Notificações de Match</span>
                <div className="w-10 h-5 bg-indigo-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 flex items-center gap-2"><Mail size={14} /> Newsletter Semanal</span>
                <div className="w-10 h-5 bg-slate-800 rounded-full relative">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-slate-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
