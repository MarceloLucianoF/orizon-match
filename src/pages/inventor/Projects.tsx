import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getUserProjects, updateProject } from "../../services/projectService";
import { Plus, Loader2, FolderKanban, Activity, BarChart3, Pause, Play, Settings2, X, Save } from "lucide-react";
import { EmptyState } from "../../components/EmptyState";
import { useTranslation } from "react-i18next";

export function Projects() {
  const { user } = useAuth();
  const { t } = useTranslation();
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
      alert(t("projects.alerts.errorToggleStatus"));
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
      alert(t("projects.alerts.errorSave"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{t("projects.title")}</h1>
          <p className="text-slate-400 mt-1">{t("projects.subtitle")}</p>
        </div>
        <Link 
          to="/projects/new"
          className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(0,181,156,0.3)] flex items-center gap-2"
        >
          <Plus size={18} /> {t("projects.newProject")}
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-teal-500" size={32} />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
          <EmptyState
            icon={FolderKanban}
            title={t("projects.empty.title")}
            description={t("projects.empty.description")}
            ctaLabel={t("projects.empty.cta")}
            ctaLink="/projects/new"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {projects.map((project) => {
            const segmentLabel = t(`projects.segments.${project.segment}`, { defaultValue: project.segment });
            const typeLabel = t(`projects.types.${project.type}`, { defaultValue: project.type });
            return (
              <div key={project.id} className={`bg-slate-900/60 backdrop-blur-xl border rounded-2xl p-6 transition-all shadow-xl flex flex-col md:flex-row gap-6 ${
                project.active ? "border-slate-700 hover:border-teal-500/50" : "border-slate-800 opacity-60 grayscale-[50%]"
              }`}>
                
                {/* Lado Esquerdo: Score Radial */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center bg-slate-950/50 rounded-xl p-4 border border-slate-800 w-full md:w-32 relative">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">{t("projects.readinessScore")}</p>
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-800" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className={`transition-all duration-1000 ease-out ${project.readinessScore >= 80 ? 'text-emerald-500' : project.readinessScore >= 50 ? 'text-teal-500' : 'text-amber-500'}`} strokeWidth="4" strokeDasharray={`${project.readinessScore}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
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
                        {project.active ? t("projects.status.running") : t("projects.status.paused")}
                      </div>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        {segmentLabel}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-100 mb-1 truncate" title={project.title}>{project.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {t("projects.cardDescription", { type: typeLabel, maturity: project.maturity })}
                    </p>
                  </div>

                  {/* Footer: Métricas Básicas */}
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Activity size={14} className="text-teal-400" />
                      <span className="text-sm font-medium">{t("projects.radarActive")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <BarChart3 size={14} className="text-cyan-400" />
                      <span className="text-sm font-medium">{t("projects.autoAnalysis")}</span>
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Ações */}
                <div className="flex-shrink-0 flex md:flex-col gap-2 w-full md:w-auto pt-4 md:pt-0 md:pl-4 md:border-l border-slate-800 justify-center md:justify-start">
                  <Link 
                    to={`/projects/${project.id}`} 
                    className="flex-1 md:flex-none text-center bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {t("projects.actions.viewDetails")}
                  </Link>
                  <Link 
                    to={`/matches?project=${project.id}`} 
                    className="flex-1 md:flex-none text-center bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {t("projects.actions.viewMatches")}
                  </Link>
                  <button 
                    onClick={() => setEditingProject({ ...project })}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Settings2 size={16} /> {t("projects.actions.edit")}
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(project.id, project.active)}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      project.active 
                        ? "border-slate-700 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30 text-slate-400" 
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    }`}
                  >
                    {project.active ? <><Pause size={16} /> {t("projects.actions.pause")}</> : <><Play size={16} /> {t("projects.actions.resume")}</>}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Edição */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040B1A]/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Settings2 className="text-teal-400" size={20} />
                {t("projects.editModal.title")}
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
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t("projects.editModal.projectTitle")}</label>
                  <input 
                    type="text" 
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t("projects.editModal.segment")}</label>
                  <select 
                    value={editingProject.segment}
                    onChange={(e) => setEditingProject({...editingProject, segment: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 appearance-none"
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
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t("projects.editModal.type")}</label>
                  <select 
                    value={editingProject.type}
                    onChange={(e) => setEditingProject({...editingProject, type: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 appearance-none"
                    required
                  >
                    <option value="software">Software/Plataforma</option>
                    <option value="hardware">Hardware/Equipamento</option>
                    <option value="process">Processo/Metodologia</option>
                    <option value="material">Novo Material</option>
                  </select>
                </div>

                <div className="bg-teal-500/10 border border-teal-500/20 p-4 rounded-xl mt-6">
                  <p className="text-xs text-teal-300 leading-relaxed">
                    {t("projects.editModal.tip")}
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
                {t("common.cancel")}
              </button>
              <button 
                type="submit" 
                form="editProjectForm"
                disabled={isSaving}
                className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(0,181,156,0.3)]"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? t("projects.editModal.saving") : t("projects.editModal.saveChanges")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
