import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { Loader2, MapPin, Building2, Tag, Target, Edit3, Shield } from "lucide-react";

export function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    async function loadProfile() {
      try {
        const userDoc = await getDoc(doc(db, "users", user!.uid));
        if (userDoc.exists()) {
          setProfileData(userDoc.data());
        }
      } catch (err) {
        console.error("Error loading profile", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center">
        <h2 className="text-xl font-semibold text-slate-200 mb-2">Perfil não encontrado</h2>
        <p className="text-slate-400">Não foi possível carregar os dados da sua organização.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* HEADER RICO (Banner + Avatar) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Banner */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-indigo-600 via-purple-600 to-slate-900 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
          <button className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2">
            <Edit3 size={16} /> Editar Capa
          </button>
        </div>

        {/* Informações Principais */}
        <div className="px-8 pb-8 relative">
          {/* Avatar Flutuante */}
          <div className="absolute -top-16 md:-top-20 left-8">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-800 rounded-2xl border-4 border-slate-900 shadow-2xl flex items-center justify-center overflow-hidden relative group">
              <Building2 size={64} className="text-slate-500 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Edit3 className="text-white" size={24} />
              </div>
            </div>
          </div>

          {/* Nome e Role */}
          <div className="pt-20 md:pt-24 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-slate-100">{profileData.name || "Sua Organização"}</h1>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Shield size={12} /> Verificado
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                  {profileData.role === 'ict' ? 'ICT / Universidade' : profileData.role === 'company' ? 'Empresa / Indústria' : 'Investidor'}
                </span>
                {profileData.location?.region && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={16} /> {profileData.location.region}
                  </span>
                )}
              </div>
            </div>
            
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors border border-slate-700 flex items-center gap-2">
              <Edit3 size={16} /> Editar Perfil
            </button>
          </div>
        </div>
      </div>

      {/* DETALHES DO PERFIL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Segmentos de Atuação */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
          <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Tag className="text-indigo-400" size={20} /> Segmentos de Atuação
          </h3>
          {profileData.segments && profileData.segments.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profileData.segments.map((seg: string) => (
                <span key={seg} className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-sm font-medium uppercase tracking-wide border border-slate-700">
                  {seg}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Nenhum segmento configurado.</p>
          )}
        </div>

        {/* Interesses Estratégicos */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
          <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Target className="text-pink-400" size={20} /> Interesses Estratégicos
          </h3>
          <div className="space-y-4">
            {profileData.interests?.research && (
              <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">R&D</div>
                <div>
                  <span className="text-sm font-medium block">P&D / Transferência de Tecnologia</span>
                </div>
              </div>
            )}
            {profileData.interests?.investment && (
              <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">$</div>
                <div>
                  <span className="text-sm font-medium block">Investimento / M&A</span>
                </div>
              </div>
            )}
            {profileData.interests?.industry && (
              <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">IND</div>
                <div>
                  <span className="text-sm font-medium block">Parceria Industrial / Fornecimento</span>
                </div>
              </div>
            )}
            
            {(!profileData.interests || (!profileData.interests.research && !profileData.interests.investment && !profileData.interests.industry)) && (
              <p className="text-slate-500 text-sm">Nenhum interesse mapeado.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
