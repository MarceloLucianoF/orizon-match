import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getUserProjects } from "../services/projectService";
import { Plus, Loader2, FolderKanban } from "lucide-react";

export function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    async function load() {
      try {
        const data = await getUserProjects(user!.uid);
        setProjects(data);
      } catch (err) {
        console.error("Error loading projects", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Meus Projetos</h1>
        <Link 
          to="/projects/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
        >
          <Plus size={20} />
          Novo Projeto
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center">
          <FolderKanban className="mx-auto text-slate-600 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-slate-300 mb-2">Nenhum projeto encontrado</h2>
          <p className="text-slate-500 mb-6">Você ainda não cadastrou nenhum projeto na plataforma.</p>
          <Link 
            to="/projects/new"
            className="inline-block bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all"
          >
            Criar meu primeiro projeto
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.1)] flex flex-col h-full">
              <div className="flex-1">
                <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300 mb-4">
                  {project.segment}
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">{project.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  Tipo: {project.type} | Maturidade: {project.maturity}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Recente'}
                </span>
                <Link to={`/matches?project=${project.id}`} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                  Ver Matches &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
