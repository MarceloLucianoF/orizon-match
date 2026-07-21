import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../hooks/useAuth";
import { 
  FileText, Briefcase, ShieldCheck, 
  Code, Loader2,
  CheckCircle, Plus
} from "lucide-react";
import { Link } from "react-router-dom";

interface IPAsset {
  id: string;
  title: string;
  type: string;
  status: string;
  inpiNumber?: string;
}

interface AssetSelectorProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function AssetSelector({ selectedIds, onToggle }: AssetSelectorProps) {
  const { user } = useAuth();
  const [assets, setAssets] = useState<IPAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssets() {
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
    fetchAssets();
  }, [user]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'patent': return <Briefcase className="text-amber-400" size={16} />;
      case 'trademark': return <ShieldCheck className="text-teal-400" size={16} />;
      case 'software': return <Code className="text-emerald-400" size={16} />;
      default: return <FileText className="text-slate-400" size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-3">
        <Loader2 className="animate-spin text-teal-500" />
        <span className="text-xs text-slate-500 uppercase font-black tracking-widest">Carregando seus ativos...</span>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="p-8 border-2 border-dashed border-slate-800 rounded-2xl text-center space-y-4">
        <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto">
          <FileText className="text-slate-700" size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-300">Nenhum Ativo Encontrado</h4>
          <p className="text-[11px] text-slate-500 mt-1">Você ainda não registrou nenhum ativo de PI no seu portfólio.</p>
        </div>
        <Link 
          to="/assets" 
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600/20 text-teal-400 border border-teal-500/30 rounded-lg text-xs font-bold hover:bg-teal-600/30 transition-all"
        >
          <Plus size={14} /> Registrar Ativo Agora
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {assets.map(asset => {
        const isSelected = selectedIds.includes(asset.id);
        return (
          <button
            key={asset.id}
            type="button"
            onClick={() => onToggle(asset.id)}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              isSelected 
                ? 'bg-teal-500/10 border-teal-500 ring-1 ring-teal-500' 
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-teal-500/20' : 'bg-slate-900'}`}>
              {getIcon(asset.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-200 truncate">{asset.title}</h4>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tight">{asset.inpiNumber || 'Sem número INPI'}</p>
            </div>
            {isSelected ? (
              <CheckCircle size={20} className="text-teal-400" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-slate-800" />
            )}
          </button>
        );
      })}
    </div>
  );
}
