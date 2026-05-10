import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, functions } from "../../firebase/config";
import { httpsCallable } from "firebase/functions";
import { 
  ArrowLeft, Eye, Star, Zap, 
  Shield, FileText
} from "lucide-react";
import { VDRRoom } from "../../components/VDRRoom";

export function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const snap = await getDoc(doc(db, "projects", id));
        if (snap.exists()) {
          setProject({ id: snap.id, ...snap.data() });
          
          // Record view analytics
          const recordViewFn = httpsCallable(functions, 'recordView');
          recordViewFn({ projectId: id }).catch(err => console.error("Analytics error:", err));
        } else {
          navigate("/projects");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

  if (loading) return (
    <div className="flex justify-center p-20 text-indigo-500">
      <Zap className="animate-spin" size={48} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/projects" className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{project.title}</h1>
            <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
              <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{project.segment}</span>
              <span>•</span>
              <span>TRL {project.maturity}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to={`/matches?project=${project.id}`} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2">
            <Zap size={18} /> Ver Matches
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="text-indigo-400" size={20} />
              Resumo do Projeto
            </h3>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {project.summary}
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="text-emerald-400" size={20} />
              Virtual Data Room (VDR)
            </h3>
            <VDRRoom inpiStatus={project.inpiStatus} />
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Métricas de Alcance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Eye size={14} />
                  <span className="text-[10px] font-bold uppercase">Views</span>
                </div>
                <div className="text-xl font-bold text-white">{project.stats?.views || 0}</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Star size={14} />
                  <span className="text-[10px] font-bold uppercase">Saves</span>
                </div>
                <div className="text-xl font-bold text-white">{project.stats?.saves || 0}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Detalhes Técnicos</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Tipo:</span>
                <span className="text-slate-200 font-medium uppercase">{project.type}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Inovação:</span>
                <span className="text-slate-200 font-medium capitalize">{project.innovationType}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Proteção:</span>
                <span className={`font-bold ${project.isProtected ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {project.isProtected ? 'Patenteado' : 'Não Protegido'}
                </span>
              </div>
              {project.patentNumber && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Nº Patente:</span>
                  <span className="text-slate-400 font-mono text-xs">{project.patentNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
