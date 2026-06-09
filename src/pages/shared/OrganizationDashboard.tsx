import { useState } from "react";
import { useOrganizationDashboard } from "../../hooks/useOrganizationDashboard";
import { OverviewTab } from "../../components/organization/OverviewTab";
import { CapacitiesTab } from "../../components/organization/CapacitiesTab";
import { FomentoTab } from "../../components/organization/FomentoTab";
import { ResearchersTab } from "../../components/organization/ResearchersTab";
import { IpBalcaoTab } from "../../components/organization/IpBalcaoTab";
import { 
  Building2, Search, X, ShieldCheck, Award, 
  Coins, GraduationCap, Cpu, CheckCircle2, 
  Bell, FileText, Send, Plus, Download,
  AlertCircle, AlertTriangle, Fingerprint, Mail
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function OrganizationDashboard() {
  const { t } = useTranslation();
  const {
    loading,
    stats,
    org,
    recentProjects,
    challenges,
    activeTab,
    setActiveTab,
    labs,
    newLabName,
    setNewLabName,
    newLabArea,
    setNewLabArea,
    newLabEquip,
    setNewLabEquip,
    handleAddLab,
    fundingCalls,
    researchersSearch,
    setResearchersSearch,
    filteredResearchers,
    royaltyRate,
    setRoyaltyRate,
    allowExclusive,
    setAllowExclusive,
    isConfigSaving,
    activePatents,
    handleSaveConfig,
    handleValidateTRL,
    pendingAudits
  } = useOrganizationDashboard();

  // Premium Modal States
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");

  // Modal form states
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifLevel, setNotifLevel] = useState("info");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTRL, setSelectedTRL] = useState(4);
  const [validateOpinion, setValidateOpinion] = useState("");
  const [proposedBudget, setProposedBudget] = useState("");
  const [proposalScope, setProposalScope] = useState("");
  const [allocationHours, setAllocationHours] = useState("20");
  const [allocationRole, setAllocationRole] = useState("researcher");
  const [inventorQuery, setInventorQuery] = useState("");
  const [fiscalYear, setFiscalYear] = useState("2026");

  const openModal = (type: string, data: any = null) => {
    setActiveModal(type);
    setModalData(data);
    setIsSubmitting(false);
    setIsSuccess(false);
    setProgress(0);
    setProgressMsg("");

    // Initialize values based on data
    if (type === 'validate_trl' && data) {
      setSelectedTRL(data.declaredTRL || data.maturity || 4);
      setValidateOpinion("");
    } else if (type === 'prepare_proposal' && data) {
      setProposedBudget(data.amount || "R$ 500k");
      setProposalScope("");
      setSelectedProject(recentProjects[0]?.id || "");
    } else if (type === 'allocate_researcher' && data) {
      setSelectedProject(recentProjects[0]?.id || "");
      setAllocationHours("20");
      setAllocationRole("researcher");
    } else if (type === 'add_lab') {
      setNewLabName("");
      setNewLabArea("");
      setNewLabEquip("");
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  // Run progress animation simulation
  const runProgress = (messages: string[], onComplete: () => void) => {
    setIsSubmitting(true);
    let currentProgress = 0;
    
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      
      const msgIndex = Math.min(
        Math.floor((currentProgress / 100) * messages.length),
        messages.length - 1
      );
      setProgressMsg(messages[msgIndex]);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsSubmitting(false);
        setIsSuccess(true);
        onComplete();
      }
    }, 80);
  };

  const handleMassNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runProgress([
      "Estruturando mensagens transacionais...",
      "Configurando disparo via barramento de eventos...",
      "Disparando mensagens para os canais selecionados...",
      "Notificações registradas no timeline!"
    ], () => {
      setNotifTitle("");
      setNotifBody("");
    });
  };

  const handleValidateTRLConfirm = () => {
    if (!modalData) return;
    runProgress([
      "Analisando integridade do projeto...",
      "Verificando documentação técnica de PI...",
      "Registrando transação no audit log imutável...",
      "Homologando nível de maturidade na base...",
      "Finalizando emissão do selo 'ICT Verified'!"
    ], async () => {
      await handleValidateTRL(modalData.id, selectedTRL);
    });
  };

  const handlePrepareProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runProgress([
      "Reunindo metadados do projeto selecionado...",
      "Consolidando orçamentos e encargos de fomento...",
      "Alocando infraestrutura e equipe no edital...",
      "Assinando digitalmente com chaves da ICT...",
      "Submetendo proposta ao portal oficial da agência!"
    ], () => {});
  };

  const handleAllocateResearcherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runProgress([
      "Verificando compatibilidade horária do pesquisador...",
      "Vinculando termo de alocação de P&D...",
      "Atualizando timeline e gerando logs operacionais..."
    ], () => {});
  };

  const handleAddLabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runProgress([
      "Salvando metadados da infraestrutura...",
      "Homologando capacidades técnicas FINEP/EMBRAPII...",
      "Registrando infraestrutura no portfólio..."
    ], () => {
      handleAddLab({ preventDefault: () => {} } as any);
    });
  };

  const handleExportEmbrapiiReport = () => {
    runProgress([
      "Consolidando base de dados financeira de fomento...",
      "Reunindo registros imutáveis de Due Diligence...",
      "Verificando assinaturas de NDAs de parceiros...",
      "Gerando assinatura criptográfica da ICT...",
      "Compilando documento PDF auditável!"
    ], () => {
      // Simulate download trigger
      const link = document.createElement("a");
      link.href = "#";
      link.setAttribute("download", `Relatorio_EMBRAPII_${org?.id || "inatel"}.pdf`);
      document.body.appendChild(link);
      // Clean up
      document.body.removeChild(link);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6">
        <Building2 className="mx-auto text-slate-800" size={64} />
        <h2 className="text-2xl font-bold text-white">{t("dashboard.organization.noLinkedOrg")}</h2>
        <p className="text-slate-400">{t("dashboard.organization.noLinkedOrgDesc")}</p>
        <button className="bg-indigo-600 px-6 py-3 rounded-xl font-bold text-white">{t("dashboard.organization.requestAccess")}</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Building2 size={20} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/80">ICT & EMBRAPII Hub</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{org.name}</h1>
          <p className="text-slate-400 text-sm mt-1">Centro de Comando de Fomento e Gestão de Portfólio Deep Tech</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => openModal('consult_inventor')}
            className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-slate-400 text-sm font-bold flex items-center gap-2 hover:text-white hover:border-slate-700 transition-all shadow-lg"
          >
             <Search size={18} /> Consultar Inventor
          </button>
          <button 
            onClick={handleExportEmbrapiiReport}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all"
          >
             Relatório EMBRAPII
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 self-start max-w-max">
        {[
          { id: "overview", label: "Overview" },
          { id: "capacities", label: "Laboratórios e Vitrine" },
          { id: "fomento", label: "Editais e Radar" },
          { id: "researchers", label: "Pesquisadores" },
          { id: "ip_balcao", label: "Balcão de Patentes" }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Renderers */}
      {activeTab === "overview" && (
        <OverviewTab 
          stats={stats}
          pendingAudits={pendingAudits}
          recentProjects={recentProjects}
          challenges={challenges}
          labs={labs}
          openModal={openModal}
        />
      )}

      {activeTab === "capacities" && (
        <CapacitiesTab 
          labs={labs}
          newLabName={newLabName}
          setNewLabName={setNewLabName}
          newLabArea={newLabArea}
          setNewLabArea={setNewLabArea}
          newLabEquip={newLabEquip}
          setNewLabEquip={setNewLabEquip}
          handleAddLab={handleAddLab}
        />
      )}

      {activeTab === "fomento" && (
        <FomentoTab fundingCalls={fundingCalls} openModal={openModal} />
      )}

      {activeTab === "researchers" && (
        <ResearchersTab 
          researchersSearch={researchersSearch}
          setResearchersSearch={setResearchersSearch}
          filteredResearchers={filteredResearchers}
          openModal={openModal}
        />
      )}

      {activeTab === "ip_balcao" && (
        <IpBalcaoTab 
          activePatents={activePatents}
          royaltyRate={royaltyRate}
          setRoyaltyRate={setRoyaltyRate}
          allowExclusive={allowExclusive}
          setAllowExclusive={setAllowExclusive}
          isConfigSaving={isConfigSaving}
          handleSaveConfig={handleSaveConfig}
        />
      )}

      {/* Premium Custom Modals Container */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60 animate-in fade-in duration-200">
          <div className={`relative w-full ${
            ['validate_trl', 'prepare_proposal', 'embrapit_report', 'consult_inventor'].includes(activeModal) 
              ? 'max-w-3xl' 
              : 'max-w-lg'
          } bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto transition-all`}>
            {/* Background decorative lights */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-fuchsia-500/10 blur-[40px] rounded-full -ml-16 -mb-16 pointer-events-none" />

            {/* Modal Header */}
            <div className="flex justify-between items-center relative z-10 border-b border-slate-850 pb-4">
              <div className="flex items-center gap-2.5">
                {activeModal === 'mass_notification' && <Bell className="text-indigo-400" size={20} />}
                {activeModal === 'validate_trl' && <Award className="text-fuchsia-400" size={20} />}
                {activeModal === 'prepare_proposal' && <Coins className="text-amber-400" size={20} />}
                {activeModal === 'add_lab' && <Plus className="text-emerald-400" size={20} />}
                {activeModal === 'allocate_researcher' && <GraduationCap className="text-indigo-400" size={20} />}
                {activeModal === 'embrapit_report' && <FileText className="text-emerald-400" size={20} />}
                {activeModal === 'consult_inventor' && <Search className="text-slate-400" size={20} />}
                
                <h3 className="font-extrabold text-white text-base">
                  {activeModal === 'mass_notification' && "Disparar Alerta de Massa"}
                  {activeModal === 'validate_trl' && "Homologação Técnica de TRL"}
                  {activeModal === 'prepare_proposal' && "Preparar Proposta de Fomento"}
                  {activeModal === 'add_lab' && "Homologar Novo Laboratório"}
                  {activeModal === 'allocate_researcher' && "Alocar Pesquisador em Projeto"}
                  {activeModal === 'embrapit_report' && "Exportar Relatório EMBRAPII"}
                  {activeModal === 'consult_inventor' && "Consultar Inventor (Lattes)"}
                </h3>
              </div>
              <button 
                onClick={closeModal} 
                className="p-1.5 bg-slate-950 border border-slate-800 rounded-xl hover:text-white text-slate-400 hover:border-slate-700 transition-colors"
                disabled={isSubmitting}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content Switch */}
            <div className="relative z-10 py-1">
              
              {/* SUBMITTING STATE */}
              {isSubmitting && (
                <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-300">
                  <div className="relative flex items-center justify-center">
                    <div className="w-20 h-20 border-4 border-slate-800 rounded-full" />
                    <div className="absolute w-20 h-20 border-4 border-t-indigo-500 border-r-fuchsia-500 rounded-full animate-spin" />
                    <span className="absolute font-mono text-xs font-black text-white">{progress}%</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-400 tracking-[0.2em] uppercase animate-pulse">Processando Transação</h4>
                    <p className="text-xs text-indigo-200/80 italic max-w-xs">{progressMsg}</p>
                  </div>
                  <div className="w-full max-w-xs bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                    <div className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 h-full rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* SUCCESS STATE */}
              {!isSubmitting && isSuccess && (
                <div className="py-10 flex flex-col items-center justify-center space-y-6 text-center animate-in scale-in duration-300">
                  <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.25)] animate-pulse">
                    <CheckCircle2 size={40} className="animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-white">Operação Concluída com Sucesso!</h4>
                    <p className="text-xs text-slate-400 max-w-md leading-relaxed mx-auto">
                      {activeModal === 'mass_notification' && "O alerta de massa foi devidamente disparado para 14 pesquisadores ativos via In-App e Email de forma prioritária."}
                      {activeModal === 'validate_trl' && `O projeto "${modalData?.title}" foi homologado em TRL ${selectedTRL} com o selo "ICT Verified" emitido na governança.`}
                      {activeModal === 'prepare_proposal' && `Candidatura à chamada do edital "${modalData?.title}" submetida com sucesso ao portal oficial da agência!`}
                      {activeModal === 'add_lab' && "O laboratório foi cadastrado e suas competências de fomento foram homologadas no polo tecnológico Inatel."}
                      {activeModal === 'allocate_researcher' && `Pesquisador alocado com sucesso e termo de alocação de P&D vinculado ao projeto.`}
                      {activeModal === 'embrapit_report' && "O Relatório de fomento foi gerado, assinado eletronicamente e o download do PDF foi iniciado."}
                    </p>
                  </div>
                  <button 
                    onClick={closeModal}
                    className="px-8 py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 rounded-xl text-xs font-bold text-slate-300 transition-colors uppercase tracking-widest"
                  >
                    Fechar Painel
                  </button>
                </div>
              )}

              {/* FORM STATES */}
              {!isSubmitting && !isSuccess && (
                <>
                  {/* 1. MASS NOTIFICATION */}
                  {activeModal === 'mass_notification' && (
                    <form onSubmit={handleMassNotificationSubmit} className="space-y-4">
                      {/* Criticality Warning Banner */}
                      {notifLevel === 'critical' && (
                        <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-start gap-3 animate-pulse">
                          <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={18} />
                          <div className="text-xs">
                            <strong className="text-rose-300 block mb-0.5">⚠️ ALERTA CRÍTICO SELECIONADO</strong>
                            <span className="text-rose-400/90 leading-relaxed">Esta notificação enviará um SMS push, email prioritário e banner in-app persistente aos pesquisadores. Use apenas para comunicações oficiais e bloqueios legais.</span>
                          </div>
                        </div>
                      )}
                      {notifLevel === 'warning' && (
                        <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-3">
                          <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={18} />
                          <div className="text-xs">
                            <strong className="text-amber-300 block mb-0.5">AVISO IMPORTANTE</strong>
                            <span className="text-amber-400/90 leading-relaxed">Notificação de alerta com prazo. Enviará notificação por email padrão e destaque in-app. Recomendado para editais próximos e revisões periódicas.</span>
                          </div>
                        </div>
                      )}
                      {notifLevel === 'info' && (
                        <div className="p-3.5 bg-blue-500/10 border border-blue-500/25 rounded-2xl flex items-start gap-3">
                          <Bell className="text-blue-400 shrink-0 mt-0.5" size={18} />
                          <div className="text-xs">
                            <strong className="text-blue-300 block mb-0.5">INFORMATIVO GERAL</strong>
                            <span className="text-blue-400/90 leading-relaxed">Notificação regular. Enviará apenas aviso silencioso in-app e email semanal de resumo.</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Título do Alerta</label>
                        <input 
                          type="text" 
                          required
                          value={notifTitle} 
                          onChange={e => setNotifTitle(e.target.value)}
                          placeholder="Ex: Autorização Obrigatória de Documentos de PI"
                          className={`w-full bg-slate-950 border ${
                            notifLevel === 'critical' ? 'focus:border-rose-500 focus:ring-rose-500/15' :
                            notifLevel === 'warning' ? 'focus:border-amber-500 focus:ring-amber-500/15' :
                            'focus:border-indigo-500 focus:ring-indigo-500/15'
                          } border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:ring-2 transition-all`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grau de Criticidade</label>
                          <select 
                            value={notifLevel}
                            onChange={e => setNotifLevel(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                          >
                            <option value="info">Normal (Informativo)</option>
                            <option value="warning">Atenção (Recomendações e Prazos)</option>
                            <option value="critical">Crítico (Bloqueio ou Exigência Legal)</option>
                          </select>
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Público Alvo</label>
                          <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 flex items-center justify-between h-[38px]">
                            <span>14 Pesquisadores ativos</span>
                            <span className="bg-indigo-500/10 text-indigo-400 text-[9px] px-2 py-0.5 rounded border border-indigo-500/20 font-bold uppercase">Inatel NGTI</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conteúdo da Notificação</label>
                        <textarea 
                          required
                          value={notifBody} 
                          onChange={e => setNotifBody(e.target.value)}
                          placeholder="Digite as instruções para os pesquisadores. Ex: Solicitamos que revisem os arquivos do VDR até sexta-feira para o edital EMBRAPII."
                          rows={4}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all resize-none"
                        />
                      </div>

                      {/* Audience avatars list */}
                      <div className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-850 flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {['RS', 'AL', 'CS', 'JM', 'FP'].map((initials, idx) => (
                            <div key={idx} className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-[9px] font-bold text-indigo-300">
                              {initials}
                            </div>
                          ))}
                          <div className="w-6 h-6 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-500">
                            +9
                          </div>
                        </div>
                        <div className="flex gap-3 text-[10px] text-slate-400 font-bold uppercase">
                          <span className="flex items-center gap-1 text-indigo-400/90"><Mail size={11} /> Email</span>
                          <span className="flex items-center gap-1 text-indigo-400/90"><Bell size={11} /> Push</span>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className={`w-full py-3.5 ${
                          notifLevel === 'critical' ? 'bg-rose-600 hover:bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.25)]' :
                          notifLevel === 'warning' ? 'bg-amber-600 hover:bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]' :
                          'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.25)]'
                        } text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-widest`}
                      >
                        <Send size={12} /> Disparar para Todos os Pesquisadores
                      </button>
                    </form>
                  )}

                  {/* 2. VALIDATE TRL */}
                  {activeModal === 'validate_trl' && modalData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Project Details & Technical opinion */}
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-850 space-y-3">
                          <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">Projeto Pendente</span>
                          <h4 className="font-bold text-white text-sm mt-1">{modalData.title}</h4>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-450">Declarado pelo Inventor:</span>
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black text-[10px]">TRL {modalData.declaredTRL || modalData.maturity || 4}</span>
                          </div>
                        </div>

                        {/* Opinion */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Parecer Técnico / Justificativa</label>
                            <span className="text-[9px] text-slate-500">Mínimo 5 caracteres</span>
                          </div>
                          <textarea 
                            required
                            value={validateOpinion}
                            onChange={e => setValidateOpinion(e.target.value)}
                            placeholder="Descreva as evidências observadas no protótipo que sustentam este nível de maturidade..."
                            rows={4}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all resize-none"
                          />
                        </div>

                        {/* Quick insertion template chips */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Modelos Rápidos:</span>
                          <div className="flex flex-wrap gap-2 pt-0.5">
                            {[
                              { label: "Ensaio Bancada", text: "Ensaio de bancada concluído e caracterizado com sucesso." },
                              { label: "Câmara Anecoica", text: "Testes de rádio em câmara anecoica do CRR validados sob ensaio regulatório." },
                              { label: "Planta Piloto", text: "Protótipo instalado e testado em ambiente de planta piloto simulada." },
                              { label: "Patente Depositada", text: "Tecnologia mapeada e patente depositada com conformidade técnica." }
                            ].map(chip => (
                              <button
                                key={chip.label}
                                type="button"
                                onClick={() => setValidateOpinion(prev => prev ? prev + " " + chip.text : chip.text)}
                                className="px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 rounded-lg text-[9px] text-slate-400 hover:text-white transition-all font-semibold"
                              >
                                + {chip.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl text-[10px] text-slate-400 flex items-start gap-2.5 leading-relaxed">
                          <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                          <span>Esta homologação emitirá um certificado digital imutável assinado pelo NIT do Inatel e registrará no log de auditoria da governança.</span>
                        </div>
                      </div>

                      {/* Right: Interactive NASA TRL selector */}
                      <div className="space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">Nível de Maturidade Homologado</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => {
                              const getLvlName = (l: number) => {
                                if (l <= 3) return "Pesquisa Básica";
                                if (l <= 6) return "Desenvolvimento";
                                return "Introdução Comercial";
                              };
                              const isSelected = selectedTRL === lvl;
                              return (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => setSelectedTRL(lvl)}
                                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                                    isSelected 
                                      ? lvl <= 3 ? 'bg-blue-600/15 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.15)]' :
                                        lvl <= 6 ? 'bg-fuchsia-600/15 border-fuchsia-500 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.15)]' :
                                        'bg-emerald-600/15 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                      : 'bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  <span className="text-lg font-black">{lvl}</span>
                                  <span className="text-[7px] font-bold uppercase tracking-wider text-center line-clamp-1">{getLvlName(lvl)}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Interactive TRL Level Explanatory Card */}
                        <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-1.5 min-h-[90px]">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                            <span className="text-slate-450">Definição TRL {selectedTRL}:</span>
                            <span className={
                              selectedTRL <= 3 ? 'text-blue-400' :
                              selectedTRL <= 6 ? 'text-fuchsia-400' :
                              'text-emerald-400'
                            }>
                              {selectedTRL <= 3 ? 'Fase Científica' : selectedTRL <= 6 ? 'Fase Protótipo' : 'Fase Industrial'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-350 leading-relaxed">
                            {selectedTRL === 1 && "Princípios básicos observados e relatados. Transição da pesquisa fundamental para a pesquisa aplicada."}
                            {selectedTRL === 2 && "Formulação tecnológica de conceito e/ou aplicação prática. Criação de formulações matemáticas analíticas."}
                            {selectedTRL === 3 && "Prova de conceito analítica e experimental de funções e características cruciais da tecnologia."}
                            {selectedTRL === 4 && "Validação de componentes/protótipo de baixa fidelidade em ambiente laboratorial controlado."}
                            {selectedTRL === 5 && "Validação de componentes/protótipo funcional em ambiente de simulação ou meio relevante."}
                            {selectedTRL === 6 && "Demonstração do subsistema/modelo funcional no final da fase relevante (Início da escala)."}
                            {selectedTRL === 7 && "Demonstração do protótipo em sistema operacional real em campo (Ex: ensaio em voo)."}
                            {selectedTRL === 8 && "Sistema real concluído e qualificado por ensaios e demonstrações finais homologadas."}
                            {selectedTRL === 9 && "Sistema comprovado em missões reais com sucesso comercial pleno na indústria."}
                          </p>
                        </div>

                        <button 
                          onClick={handleValidateTRLConfirm}
                          disabled={validateOpinion.length < 5}
                          className="w-full py-3.5 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(217,70,239,0.25)] flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-55 disabled:cursor-not-allowed"
                        >
                          <Award size={14} /> Confirmar Validação & Conceder Selo
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. PREPARE PROPOSAL */}
                  {activeModal === 'prepare_proposal' && modalData && (
                    <form onSubmit={handlePrepareProposalSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Input fields */}
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-850 space-y-1.5">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded uppercase">{modalData.agency}</span>
                            <span className="text-slate-500 text-[10px] font-mono">Edital 2026</span>
                          </div>
                          <h4 className="font-bold text-white text-sm mt-1">{modalData.title}</h4>
                          <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900 mt-2">
                            <span>Financiamento: <strong>{modalData.amount}</strong></span>
                            <span>Prazo: <strong>{modalData.deadline}</strong></span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projeto Vinculado do Portfólio</label>
                          <select 
                            value={selectedProject}
                            onChange={e => setSelectedProject(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                          >
                            {recentProjects.map(p => (
                              <option key={p.id} value={p.id}>{p.title} (TRL {p.validatedTRL || p.declaredTRL})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Orçamento Total Proposto (R$)</label>
                          <input 
                            type="text" 
                            required
                            value={proposedBudget}
                            onChange={e => setProposedBudget(e.target.value)}
                            placeholder="Ex: 1200000"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escopo de Trabalho Resumido</label>
                          <textarea 
                            required
                            value={proposalScope}
                            onChange={e => setProposalScope(e.target.value)}
                            placeholder="Descreva o papel do Inatel no co-desenvolvimento tecnológico do projeto frente ao edital..."
                            rows={3}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all resize-none"
                          />
                        </div>
                      </div>

                      {/* Right: Dynamic EMBRAPII Funding Model Simulator */}
                      <div className="space-y-4 flex flex-col justify-between">
                        <div className="p-5 bg-slate-950/60 border border-slate-850 rounded-3xl space-y-4 flex-1">
                          <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                            <Coins className="text-amber-400" size={18} />
                            <h5 className="font-extrabold text-xs text-white uppercase tracking-wider">Simulador de Fomento de Parceria</h5>
                          </div>

                          {(() => {
                            const raw = proposedBudget.replace(/[^\d]/g, "");
                            const val = raw ? parseInt(raw, 10) : 500000;
                            
                            const subEmbrapii = val * 0.50; // 50%
                            const matchCompany = val * 0.33; // 33%
                            const partnerIct = val * 0.17; // 17%

                            const formatCurrency = (v: number) => {
                              return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
                            };

                            return (
                              <div className="space-y-4">
                                <div className="text-center bg-slate-950 p-3 rounded-2xl border border-slate-900">
                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Orçamento Simulado</span>
                                  <span className="text-xl font-black text-white">{formatCurrency(val)}</span>
                                </div>

                                <div className="space-y-3">
                                  {/* Embrapii Subsidy */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold">
                                      <span className="text-indigo-300">EMBRAPII Subsídio (50%)</span>
                                      <span className="text-slate-200">{formatCurrency(subEmbrapii)}</span>
                                    </div>
                                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: '50%' }} />
                                    </div>
                                  </div>

                                  {/* Company Share */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold">
                                      <span className="text-emerald-300">Empresa Parceira (33%)</span>
                                      <span className="text-slate-200">{formatCurrency(matchCompany)}</span>
                                    </div>
                                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '33%' }} />
                                    </div>
                                  </div>

                                  {/* ICT Share */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold">
                                      <span className="text-rose-300">Aporte ICT Inatel (17%)</span>
                                      <span className="text-slate-200">{formatCurrency(partnerIct)}</span>
                                    </div>
                                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                                      <div className="bg-rose-500 h-full rounded-full" style={{ width: '17%' }} />
                                    </div>
                                  </div>
                                </div>

                                <p className="text-[10px] text-slate-500 leading-relaxed italic border-t border-slate-900 pt-3">
                                  * O modelo de financiamento segue as diretrizes operacionais de unidades EMBRAPII credenciadas. A contrapartida da ICT pode incluir horas técnicas e infraestrutura física alocada.
                                </p>
                              </div>
                            );
                          })()}
                        </div>

                        <button 
                          type="submit"
                          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.25)] flex items-center justify-center gap-2 uppercase tracking-widest"
                        >
                          <Send size={12} /> Submeter Candidatura de Inovação
                        </button>
                      </div>
                    </form>
                  )}

                  {/* 4. ADD LABORATORY (HOMOLOGAR NOVO LABORATÓRIO) */}
                  {activeModal === 'add_lab' && (
                    <form onSubmit={handleAddLabSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Inputs */}
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Nome do Laboratório / Infraestrutura</label>
                          <input 
                            type="text" 
                            required 
                            value={newLabName}
                            onChange={e => setNewLabName(e.target.value)}
                            placeholder="Ex: Laboratório de Biofotônica e RF Avançado"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Área de Concentração</label>
                          <input 
                            type="text" 
                            required
                            value={newLabArea}
                            onChange={e => setNewLabArea(e.target.value)}
                            placeholder="Ex: Biotecnologia / Telecom"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Equipamentos Críticos / Capacidades</label>
                          <textarea 
                            value={newLabEquip}
                            onChange={e => setNewLabEquip(e.target.value)}
                            placeholder="Ex: Analisador vetorial de redes ópticas, Cluster de processamento de borda Nvidia..."
                            rows={3}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all resize-none"
                          />
                        </div>
                      </div>

                      {/* Right: Live Preview & Submit */}
                      <div className="space-y-4 flex flex-col justify-between">
                        <div className="p-5 bg-slate-950/60 border border-slate-850 rounded-3xl space-y-4 flex-1">
                          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Live Preview da Infraestrutura</span>
                            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase">Homologação Ativa</span>
                          </div>

                          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
                            <div className="space-y-1">
                              <h5 className="font-extrabold text-sm text-white truncate">{newLabName || "Nome do Laboratório"}</h5>
                              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{newLabArea || "Área de Concentração"}</p>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Recursos Cadastrados:</span>
                              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                                {newLabEquip || "Nenhum equipamento listado ainda. Descreva as capacidades técnicas da infraestrutura."}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-slate-450">Taxa de Ocupação Padrão</span>
                                <span className="text-emerald-400 font-mono">10%</span>
                              </div>
                              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '10%' }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <button 
                          type="submit"
                          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] flex items-center justify-center gap-1.5 uppercase tracking-widest"
                        >
                          <Cpu size={14} /> Homologar Infraestrutura
                        </button>
                      </div>
                    </form>
                  )}

                  {/* 5. ALLOCATE RESEARCHER */}
                  {activeModal === 'allocate_researcher' && modalData && (
                    <form onSubmit={handleAllocateResearcherSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Inputs & Researcher Info */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-850 shadow-inner">
                          <img src={modalData.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"} alt={modalData.name} className="w-14 h-14 rounded-xl object-cover border border-slate-800 shadow shrink-0" />
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-white text-sm truncate">{modalData.name}</h4>
                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider truncate mt-0.5">{modalData.title}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[8px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono text-slate-400">H-Index: {modalData.hIndex || 34}</span>
                              <span className="text-[8px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono text-slate-400">Patentes: {modalData.patents || 8}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vincular ao Projeto Ativo</label>
                          <select 
                            value={selectedProject}
                            onChange={e => setSelectedProject(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                          >
                            {recentProjects.map(p => (
                              <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dedicação Semanal</label>
                            <select 
                              value={allocationHours}
                              onChange={e => setAllocationHours(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                            >
                              <option value="10">10h / semana</option>
                              <option value="20">20h / semana</option>
                              <option value="40">40h / semana (Exclusiva)</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Papel de Alocação</label>
                            <select 
                              value={allocationRole}
                              onChange={e => setAllocationRole(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                            >
                              <option value="coordinator">Coordenador do Projeto</option>
                              <option value="researcher">Pesquisador Principal</option>
                              <option value="assistant">Assistente de P&D</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Right: Workload Analyzer & Submit */}
                      <div className="space-y-4 flex flex-col justify-between">
                        <div className="p-5 bg-slate-950/60 border border-slate-850 rounded-3xl space-y-4 flex-1">
                          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Análise de Carga Horária</span>
                            <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-black uppercase">Simulação</span>
                          </div>

                          {(() => {
                            const addedHrs = parseInt(allocationHours, 10);
                            const currentOcc = modalData.id === 1 ? 40 : modalData.id === 2 ? 80 : 60; 
                            const totalOcc = Math.min(100, currentOcc + (addedHrs * 2)); 
                            const isOverloaded = totalOcc > 85;

                            return (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs font-bold">
                                    <span className="text-slate-400">Ocupação Atual:</span>
                                    <span className="text-white font-mono">{currentOcc}%</span>
                                  </div>
                                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                                    <div className="bg-indigo-500 h-full rounded-full animate-pulse" style={{ width: `${currentOcc}%` }} />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs font-bold">
                                    <span className="text-slate-400">Nova Carga Projetada:</span>
                                    <span className={`font-mono font-bold ${isOverloaded ? 'text-rose-400' : 'text-emerald-400'}`}>{totalOcc}%</span>
                                  </div>
                                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                                    <div className={`h-full rounded-full transition-all duration-500 ${isOverloaded ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${totalOcc}%` }} />
                                  </div>
                                </div>

                                {isOverloaded ? (
                                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] text-rose-400 flex items-start gap-2 leading-relaxed">
                                    <AlertTriangle className="shrink-0 mt-0.5 text-rose-400" size={14} />
                                    <span>Aviso: O pesquisador ficará com carga horária crítica superior a 85%. Recomenda-se remanejamento de outros subprojetos.</span>
                                  </div>
                                ) : (
                                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400 flex items-start gap-2 leading-relaxed">
                                    <CheckCircle2 className="shrink-0 mt-0.5 text-emerald-400" size={14} />
                                    <span>Alocação segura. A carga horária total projetada permanece dentro das diretrizes operacionais do Polo.</span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        <button 
                          type="submit"
                          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.25)] flex items-center justify-center gap-1.5 uppercase tracking-widest"
                        >
                          <GraduationCap size={14} /> Confirmar Alocação Técnica
                        </button>
                      </div>
                    </form>
                  )}

                  {/* 6. EXPORT EMBRAPII REPORT */}
                  {activeModal === 'embrapit_report' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: General info and selectors */}
                      <div className="space-y-4">
                        <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-4 shadow-inner">
                          <div className="flex justify-between items-center text-xs border-b border-slate-900 pb-2.5">
                            <span className="text-slate-450 font-semibold">Orçamento Total 2026:</span>
                            <span className="text-white font-mono font-bold">R$ 4.50M</span>
                          </div>
                          <div className="flex justify-between items-center text-xs border-b border-slate-900 pb-2.5">
                            <span className="text-slate-450 font-semibold">Capital Alocado:</span>
                            <span className="text-white font-mono font-bold">R$ 2.92M (65%)</span>
                          </div>
                          <div className="flex justify-between items-center text-xs border-b border-slate-900 pb-2.5">
                            <span className="text-slate-450 font-semibold">Projetos Executados:</span>
                            <span className="text-white font-bold">15 Ativos</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-450 font-semibold">Rastreabilidade Fiscal:</span>
                            <span className="text-emerald-450 font-bold flex items-center gap-1">
                              <ShieldCheck size={14} /> 100% Auditável
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Ano Fiscal do Relatório</label>
                          <select 
                            value={fiscalYear}
                            onChange={e => setFiscalYear(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                          >
                            <option value="2025">Ano Fiscal 2025</option>
                            <option value="2026">Ano Fiscal 2026 (Corrente)</option>
                            <option value="2027">Ano Fiscal 2027 (Previsão)</option>
                          </select>
                        </div>

                        <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl text-[10px] text-slate-450 flex items-start gap-2 leading-relaxed">
                          <AlertCircle className="shrink-0 text-slate-500 mt-0.5" size={15} />
                          <span>Este relatório compila os logs de transação e as mudanças de estágios de todos os projetos alocados na Unidade EMBRAPII Inatel para submissão oficial.</span>
                        </div>
                      </div>

                      {/* Right: Budget consumption visual gauge & download */}
                      <div className="space-y-4 flex flex-col justify-between">
                        <div className="p-5 bg-slate-950/60 border border-slate-850 rounded-3xl space-y-4 flex-1 shadow">
                          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Consumo da Linha de Fomento</span>
                            <span className="text-indigo-400 font-mono font-bold text-xs">65%</span>
                          </div>

                          <div className="space-y-3">
                            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850">
                              <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full" style={{ width: '65%' }} />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-center text-[10px] text-slate-400">
                              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850">
                                <span className="block text-[8px] uppercase font-bold text-slate-500">Saldo Disponível</span>
                                <strong className="text-white font-mono text-xs">R$ 1.58M</strong>
                              </div>
                              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850">
                                <span className="block text-[8px] uppercase font-bold text-slate-500">Contratos Assinados</span>
                                <strong className="text-white text-xs">12 Parcerias</strong>
                              </div>
                            </div>
                          </div>

                          {/* Signature stamp preview */}
                          <div className="p-3 bg-slate-950/70 border border-dashed border-slate-800 rounded-xl space-y-2">
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-indigo-400 tracking-wider">
                              <Fingerprint size={13} /> Assinatura Eletrônica NIT
                            </div>
                            <div className="text-[9px] font-mono text-slate-500 space-y-0.5 leading-snug">
                              <div>SIGNER: NIT_INATEL_OFFICIAL</div>
                              <div>HASH: 9a2e6f...8e11a3df2</div>
                              <div>TIMESTAMP: {new Date().toISOString()}</div>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={handleExportEmbrapiiReport}
                          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] flex items-center justify-center gap-1.5 uppercase tracking-widest"
                        >
                          <Download size={14} /> Assinar e Gerar PDF Executivo
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 7. CONSULT INVENTOR */}
                  {activeModal === 'consult_inventor' && (
                    <div className="space-y-5 animate-in fade-in duration-300">
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                          type="text" 
                          value={inventorQuery}
                          onChange={e => setInventorQuery(e.target.value)}
                          placeholder="Buscar pesquisador por nome, lattes ou linha de pesquisa..."
                          className="w-full bg-slate-950 border border-slate-850 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all shadow-inner"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
                        {[
                          { id: 1, name: "Prof. Dr. Rafael Silva", title: "Coordenador no CRR / Inatel", hIndex: 34, patents: 8, expertise: "Antenas inteligentes, Redes 5G/6G, Hardware RF", email: "rafael.silva@inatel.br", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
                          { id: 2, name: "Dr. André Lourenço", title: "Pesquisador Sênior no WAI Lab", hIndex: 28, patents: 4, expertise: "Redes Neurais, IoT Industrial, Algoritmos de Borda", email: "andre.lourenco@inatel.br", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80" },
                          { id: 3, name: "Dra. Camila Santos", title: "Pesquisadora de Segurança Cibernética", hIndex: 22, patents: 12, expertise: "Segurança de Redes, Criptografia Pós-Quântica, IoT", email: "camila.santos@inatel.br", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" }
                        ]
                        .filter(i => i.name.toLowerCase().includes(inventorQuery.toLowerCase()) || i.expertise.toLowerCase().includes(inventorQuery.toLowerCase()))
                        .map((inv, idx) => (
                          <div key={idx} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col justify-between hover:border-indigo-500/20 hover:bg-slate-900/10 transition-all group">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <img src={inv.image} alt={inv.name} className="w-10 h-10 rounded-xl object-cover border border-slate-800 shadow" />
                                <div className="min-w-0">
                                  <h4 className="font-extrabold text-white text-xs truncate group-hover:text-indigo-400 transition-colors">{inv.name}</h4>
                                  <p className="text-[9px] text-slate-500 font-semibold truncate">{inv.title}</p>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <span className="text-[8px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono text-slate-400">H-Index: {inv.hIndex}</span>
                                <span className="text-[8px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono text-slate-400">Patentes: {inv.patents}</span>
                              </div>

                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                <strong className="text-slate-300">Áreas:</strong> {inv.expertise}
                              </p>
                            </div>

                            <div className="flex gap-2.5 mt-4 pt-3 border-t border-slate-900">
                              <button
                                type="button"
                                onClick={() => openModal('allocate_researcher', inv)}
                                className="flex-1 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/30 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider text-center"
                              >
                                Alocar em Projeto
                              </button>
                              <a 
                                href={`mailto:${inv.email}`} 
                                className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 text-slate-350 hover:text-white border border-slate-850 hover:border-slate-700 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider text-center"
                              >
                                Contato
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
