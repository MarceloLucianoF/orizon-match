import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../firebase/config";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { 
  FileText, Plus, ShieldCheck, 
  Search, Filter, Loader2, 
  ExternalLink, Clock, AlertCircle,
  Briefcase, GraduationCap, Code
} from "lucide-react";
import { useTranslation } from "react-i18next";

type AssetType = 'patent' | 'trademark' | 'software' | 'design';

interface IPAsset {
  id: string;
  title: string;
  type: AssetType;
  status: 'draft' | 'filed' | 'granted' | 'expired';
  inpiNumber?: string;
  description: string;
  ownerId: string;
  createdAt: any;
}

export function AssetRegistry() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [assets, setAssets] = useState<IPAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [newAsset, setNewAsset] = useState({
    title: "",
    type: "patent" as AssetType,
    description: "",
    inpiNumber: "",
    status: "draft" as any
  });

  useEffect(() => {
    async function loadAssets() {
      if (!user) return;
      try {
        const q = query(collection(db, "assets_ip"), where("ownerId", "==", user.uid));
        const snap = await getDocs(q);
        setAssets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as IPAsset)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAssets();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "assets_ip"), {
        ...newAsset,
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });
      setAssets([{ id: docRef.id, ...newAsset, ownerId: user.uid, createdAt: new Date() } as any, ...assets]);
      setShowModal(false);
      setNewAsset({ title: "", type: "patent", description: "", inpiNumber: "", status: "draft" });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: AssetType) => {
    switch (type) {
      case 'patent': return <Briefcase className="text-amber-400" size={18} />;
      case 'trademark': return <ShieldCheck className="text-indigo-400" size={18} />;
      case 'software': return <Code className="text-emerald-400" size={18} />;
      case 'design': return <GraduationCap className="text-fuchsia-400" size={18} />;
    }
  };

  if (loading && assets.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <FileText className="text-indigo-400" /> {t("dashboard.legal.assets.title")}
          </h1>
          <p className="text-slate-400 mt-1 text-sm">{t("dashboard.legal.assets.subtitle")}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] text-sm"
        >
          <Plus size={18} /> {t("dashboard.legal.assets.newAssetBtn")}
        </button>
      </div>

      {/* Busca e Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder={t("dashboard.legal.assets.searchPlaceholder")}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500 transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button className="bg-slate-900/50 border border-slate-800 px-4 py-2.5 rounded-xl text-slate-400 flex items-center gap-2 text-sm hover:text-slate-200 transition-colors">
            <Filter size={16} /> {t("dashboard.legal.assets.filters")}
          </button>
        </div>
      </div>

      {/* Grid de Ativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl">
             <FileText className="mx-auto text-slate-700 mb-4" size={48} />
             <h3 className="text-lg font-bold text-slate-300">{t("dashboard.legal.assets.noAssets")}</h3>
             <p className="text-slate-500 text-sm mt-1">{t("dashboard.legal.assets.noAssetsDesc")}</p>
          </div>
        ) : (
          assets.map(asset => (
            <div key={asset.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 group-hover:border-indigo-500/30 transition-colors">
                  {getIcon(asset.type)}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${
                  asset.status === 'granted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  asset.status === 'filed' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-slate-800 text-slate-500 border-slate-700'
                }`}>
                  {t("dashboard.legal.assets.status." + asset.status)}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2 leading-tight">{asset.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">{asset.description}</p>
              
              <div className="space-y-3 pt-4 border-t border-slate-800">
                {asset.inpiNumber && (
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 bg-slate-950 p-2 rounded border border-slate-800">
                    <span>{asset.inpiNumber}</span>
                    <Clock size={12} />
                  </div>
                )}
                <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-slate-500">
                  <span className="flex items-center gap-1"><AlertCircle size={12} /> {t("dashboard.legal.assets.auditInovaHelix")}</span>
                  <button className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                    {t("dashboard.legal.assets.manage")} <ExternalLink size={10} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Criação (Simplified) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">{t("dashboard.legal.assets.modalTitle")}</h3>
              <p className="text-slate-400 text-sm mt-1">{t("dashboard.legal.assets.modalSubtitle")}</p>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t("dashboard.legal.assets.assetTitleLabel")}</label>
                <input 
                  required
                  type="text" 
                  value={newAsset.title}
                  onChange={e => setNewAsset({...newAsset, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  placeholder={t("dashboard.legal.assets.assetTitlePlaceholder")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t("dashboard.legal.assets.typeLabel")}</label>
                  <select 
                    value={newAsset.type}
                    onChange={e => setNewAsset({...newAsset, type: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="patent">{t("dashboard.legal.assets.types.patent")}</option>
                    <option value="trademark">{t("dashboard.legal.assets.types.trademark")}</option>
                    <option value="software">{t("dashboard.legal.assets.types.software")}</option>
                    <option value="design">{t("dashboard.legal.assets.types.design")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t("dashboard.legal.assets.inpiNumberLabel")}</label>
                  <input 
                    type="text" 
                    value={newAsset.inpiNumber}
                    onChange={e => setNewAsset({...newAsset, inpiNumber: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-all"
                    placeholder={t("dashboard.legal.assets.inpiNumberPlaceholder")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t("dashboard.legal.assets.descLabel")}</label>
                <textarea 
                  required
                  value={newAsset.description}
                  onChange={e => setNewAsset({...newAsset, description: e.target.value})}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-all resize-none"
                  placeholder={t("dashboard.legal.assets.descPlaceholder")}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-800 text-slate-400 font-bold hover:bg-slate-800 transition-all"
                >
                  {t("dashboard.legal.assets.cancel")}
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : t("dashboard.legal.assets.registerBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
