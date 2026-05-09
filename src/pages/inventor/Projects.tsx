import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getUserProjects, updateProject } from "../../services/projectService";
import { Plus, Loader2, FolderKanban, Activity, BarChart3, Pause, Play, Settings2, X, Save } from "lucide-react";

export function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    async function load() {
      try {
        const data = await getUserProjects(user!.uid);
        // Calcula o score visualmente para o frontend
        const mappedData = data.map((p: any) => {
          let score = 30; // base (criou)
          if (p.title) score += 20;
          if (p.segment) score += 20;
          if (p.maturity) score += 10;
          if (p.needs && Object.values(p.needs).some(v => v)) score += 20;
          return { ...p, readinessScore: Math.min(score, 100) };
        });
        setProjects(mappedData);
      } catch (err) {
        console.error("Error loading projects", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // UI Otimista
    setProjects(prev => prev.map(p => p.id === id ? { ...p, active: newStatus } : p));
    try {
      await updateProject(id, { active: newStatus });
    } catch (err) {
      // Rollback se falhar
      setProjects(prev => prev.map(p => p.id === id ? { ...p, active: currentStatus } : p));
      alert("Erro ao alterar o status do projeto.");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setIsSaving(true);
    
    try {
      const dataToUpdate = {
        title: editingProject.title,
        segment: editingProject.segment,
        type: editingProject.type,
      };

      await updateProject(editingProject.id, dataToUpdate);
      
      // Update local array with new readiness score logic
      setProjects(prev => prev.map(p => {
        if (p.id === editingProject.id) {
          const updated = { ...p, ...dataToUpdate };
          let score = 30;
          if (updated.title) score += 20;
          if (updated.segment) score += 20;
          if (updated.maturity) score += 10;
          if (updated.needs && Object.values(updated.needs).some(v => v)) score += 20;
          updated.readinessScore = Math.min(score, 100);
          return updated;
        }
        return p;
      }));
      setEditingProject(null);
    } catch (err) {
      alert("Erro ao salvar projeto.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Portfólio de Inovação</h1>
          <p className="text-slate-400 mt-1">Gerencie os projetos que o algoritmo da Orizon Match usa para prospectar parceiros.</p>
        </div>
        <Link 
          to="/projects/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] flex items-center gap-2"
        >
          <Plus size={18} /> Novo Projeto
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-16 text-center shadow-2xl">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderKanban className="text-indigo-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-200 mb-3">Nenhum projeto rodando</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            O algoritmo precisa de pelo menos um projeto mapeado para poder escannear o ecossistema e encontrar os melhores parceiros.
          </p>
          <Link 
            to="/projects/new"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
          >
            Cadastrar Primeiro Projeto
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className={`bg-slate-900/60 backdrop-blur-xl border rounded-2xl p-6 transition-all shadow-xl flex flex-col md:flex-row gap-6 ${
              project.active ? "border-slate-700 hover:border-indigo-500/50" : "border-slate-800 opacity-60 grayscale-[50%]"
            }`}>
              
              {/* Lado Esquerdo: Score Radial */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center bg-slate-950/50 rounded-xl p-4 border border-slate-800 w-full md:w-32 relative">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Score de<br/>Prontidão</p>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-800" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className={`transition-all duration-1000 ease-out ${project.readinessScore >= 80 ? 'text-emerald-500' : project.readinessScore >= 50 ? 'text-indigo-500' : 'text-amber-500'}`} strokeWidth="4" strokeDasharray={`${project.readinessScore}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-slate-100">{project.readinessScore}%</span>
                  </div>
                </div>
              </div>

              {/* Centro: Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      project.active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}>
                      {project.active ? "Rodando" : "Pausado"}
                    </div>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-slate-300">
                      {project.segment}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-100 mb-1 truncate" title={project.title}>{project.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                    Projeto focado em {project.type} com maturidade {project.maturity}. Algoritmo buscando matches com investidores e parceiros industriais.
                  </p>
                </div>

                {/* Footer: Métricas Básicas */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Activity size={14} className="text-indigo-400" />
                    <span className="text-sm font-medium">Radar Ativo</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <BarChart3 size={14} className="text-cyan-400" />
                    <span className="text-sm font-medium">Análise Automática</span>
                  </div>
                </div>
              </div>

              {/* Lado Direito: Ações */}
              <div className="flex-shrink-0 flex md:flex-col gap-2 w-full md:w-auto pt-4 md:pt-0 md:pl-4 md:border-l border-slate-800 justify-center md:justify-start">
                <Link 
                  to={`/matches?project=${project.id}`} 
                  className="flex-1 md:flex-none text-center bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Ver Matches
                </Link>
                <button 
                  onClick={() => setEditingProject({ ...project })}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Settings2 size={16} /> Editar
                </button>
                <button 
                  onClick={() => handleToggleStatus(project.id, project.active)}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    project.active 
                      ? "border-slate-700 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30 text-slate-400" 
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                  }`}
                >
                  {project.active ? <><Pause size={16} /> Pausar Busca</> : <><Play size={16} /> Retomar Busca</>}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal de Edição */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040B1A]/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Settings2 className="text-indigo-400" size={20} />
                Editar Projeto
              </h3>
              <button 
                onClick={() => setEditingProject(null)} 
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="editProjectForm" onSubmit={handleSaveEdit} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Título do Projeto</label>
                  <input 
                    type="text" 
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Segmento de Atuação</label>
                  <select 
                    value={editingProject.segment}
                    onChange={(e) => setEditingProject({...editingProject, segment: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                    required
                  >
                    <option value="agro">Agro/FoodTech</option>
                    <option value="health">HealthTech/BioTech</option>
                    <option value="energy">CleanTech/Energy</option>
                    <option value="industry">Indústria 4.0/IoT</option>
                    <option value="tech">Tech/SaaS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Tipo de Projeto</label>
                  <select 
                    value={editingProject.type}
                    onChange={(e) => setEditingProject({...editingProject, type: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                    required
                  >
                    <option value="software">Software/Plataforma</option>
                    <option value="hardware">Hardware/Equipamento</option>
                    <option value="process">Processo/Metodologia</option>
                    <option value="material">Novo Material</option>
                  </select>
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl mt-6">
                  <p className="text-xs text-indigo-300 leading-relaxed">
                    <strong>Dica Orizon:</strong> Manter seu segmento e tipo atualizados garante que o algoritmo de match encontre parceiros com interesses estratégicos exatos para a sua fase atual.
                  </p>
                </div>

              </form>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-800/30 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setEditingProject(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                form="editProjectForm"
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
