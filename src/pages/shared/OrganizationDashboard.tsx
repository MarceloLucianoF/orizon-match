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
  Bell, FileText, Send, Plus, Download
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
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto">
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
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="absolute font-mono text-[10px] font-black text-indigo-400">{progress}%</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest animate-pulse">Processando...</h4>
                    <p className="text-xs text-slate-400 italic max-w-xs">{progressMsg}</p>
                  </div>
                </div>
              )}

              {/* SUCCESS STATE */}
              {!isSubmitting && isSuccess && (
                <div className="py-10 flex flex-col items-center justify-center space-y-6 text-center animate-in scale-in duration-300">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 size={36} className="animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-white">Ação Executada com Sucesso!</h4>
                    <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                      {activeModal === 'mass_notification' && "O alerta de massa foi devidamente disparado para 14 pesquisadores ativos via In-App e Email."}
                      {activeModal === 'validate_trl' && `O projeto "${modalData?.title}" foi homologado em TRL ${selectedTRL} com o selo "ICT Verified" emitido.`}
                      {activeModal === 'prepare_proposal' && `Candidatura à chamada do edital "${modalData?.title}" submetida com sucesso!`}
                      {activeModal === 'add_lab' && "O laboratório foi cadastrado e suas competências foram homologadas no polo tecnológico Inatel."}
                      {activeModal === 'allocate_researcher' && `Pesquisador alocado com sucesso ao projeto selecionado.`}
                      {activeModal === 'embrapit_report' && "O Relatório de fomento foi gerado, assinado e o download do PDF foi iniciado."}
                    </p>
                  </div>
                  <button 
                    onClick={closeModal}
                    className="px-6 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 rounded-xl text-xs font-bold text-slate-300 transition-colors uppercase tracking-widest"
                  >
                    Fechar Janela
                  </button>
                </div>
              )}

              {/* FORM STATES */}
              {!isSubmitting && !isSuccess && (
                <>
                  {/* 1. MASS NOTIFICATION */}
                  {activeModal === 'mass_notification' && (
                    <form onSubmit={handleMassNotificationSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Título do Alerta</label>
                        <input 
                          type="text" 
                          required
                          value={notifTitle} 
                          onChange={e => setNotifTitle(e.target.value)}
                          placeholder="Ex: Autorização Obrigatória de Documentos de PI"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grau de Criticidade</label>
                        <select 
                          value={notifLevel}
                          onChange={e => setNotifLevel(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 outline-none focus:border-indigo-500 transition-all"
                        >
                          <option value="info">Normal (Informativo)</option>
                          <option value="warning">Atenção (Recomendações e Prazos)</option>
                          <option value="critical">Crítico (Bloqueio ou Exigência Legal)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Conteúdo da Notificação</label>
                        <textarea 
                          required
                          value={notifBody} 
                          onChange={e => setNotifBody(e.target.value)}
                          placeholder="Digite as instruções para os pesquisadores. Ex: Solicitamos que revisem os arquivos do VDR até sexta-feira para o edital EMBRAPII."
                          rows={4}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all resize-none"
                        />
                      </div>
                      <div className="flex gap-4 p-3 bg-slate-950/40 rounded-xl border border-slate-850 text-[10px] text-slate-400 font-bold uppercase">
                        <span className="flex items-center gap-1.5 text-indigo-400"><Send size={12} /> Email Ativo</span>
                        <span className="flex items-center gap-1.5 text-indigo-400"><Bell size={12} /> In-App Ativo</span>
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)] flex items-center justify-center gap-2"
                      >
                        <Send size={12} /> Disparar para 14 Pesquisadores
                      </button>
                    </form>
                  )}

                  {/* 2. VALIDATE TRL */}
                  {activeModal === 'validate_trl' && modalData && (
                    <div className="space-y-5">
                      <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-850 space-y-1">
                        <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">Projeto Pendente</span>
                        <h4 className="font-bold text-white text-sm mt-1">{modalData.title}</h4>
                        <p className="text-xs text-slate-500">Maturidade Declarada: TRL {modalData.declaredTRL || modalData.maturity || 4}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nível TRL Homologado</label>
                          <span className="text-fuchsia-400">TRL {selectedTRL}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input 
                            type="range" 
                            min="1" 
                            max="9" 
                            value={selectedTRL}
                            onChange={e => setSelectedTRL(Number(e.target.value))}
                            className="flex-1 accent-fuchsia-500 cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-wider px-1">
                          <span>TRL 1 (Conceito)</span>
                          <span>TRL 5 (Protótipo)</span>
                          <span>TRL 9 (Comercial)</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Justificativa / Parecer Técnico</label>
                        <textarea 
                          required
                          value={validateOpinion}
                          onChange={e => setValidateOpinion(e.target.value)}
                          placeholder="Ex: Protótipo de hardware testado em bancada e avaliado em câmara anecoica do CRR sob o ensaio regulatório."
                          rows={3}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all resize-none"
                        />
                      </div>

                      <div className="p-3 bg-slate-950/30 border border-slate-850 rounded-xl text-[10px] text-slate-400 flex items-center gap-2">
                        <ShieldCheck className="text-emerald-400" size={16} />
                        <span>Homologação gera assinatura de conformidade do NIT do Inatel.</span>
                      </div>

                      <button 
                        onClick={handleValidateTRLConfirm}
                        className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(217,70,239,0.2)] flex items-center justify-center gap-2"
                      >
                        <Award size={14} /> Confirmar Validação & Conceder Selo
                      </button>
                    </div>
                  )}

                  {/* 3. PREPARE PROPOSAL */}
                  {activeModal === 'prepare_proposal' && modalData && (
                    <form onSubmit={handlePrepareProposalSubmit} className="space-y-4">
                      <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-850 space-y-1.5">
                        <span className="text-[9px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded uppercase">{modalData.agency}</span>
                        <h4 className="font-bold text-white text-sm mt-1">{modalData.title}</h4>
                        <div className="flex justify-between text-xs text-slate-500 pt-1">
                          <span>Recurso: {modalData.amount}</span>
                          <span>Prazo: {modalData.deadline}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Projeto Vinculado</label>
                        <select 
                          value={selectedProject}
                          onChange={e => setSelectedProject(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none focus:border-indigo-500 transition-all"
                        >
                          {recentProjects.map(p => (
                            <option key={p.id} value={p.id}>{p.title} (TRL {p.validatedTRL || p.declaredTRL})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Orçamento Proposto (R$)</label>
                        <input 
                          type="text" 
                          required
                          value={proposedBudget}
                          onChange={e => setProposedBudget(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Escopo de Trabalho Resumido</label>
                        <textarea 
                          required
                          value={proposalScope}
                          onChange={e => setProposalScope(e.target.value)}
                          placeholder="Descreva o papel do Inatel no co-desenvolvimento tecnológico do projeto frente ao edital..."
                          rows={3}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all resize-none"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)] flex items-center justify-center gap-2"
                      >
                        <Send size={12} /> Submeter Candidatura de Inovação
                      </button>
                    </form>
                  )}

                  {/* 4. ADD LABORATORY (HOMOLOGAR NOVO LABORATÓRIO) */}
                  {activeModal === 'add_lab' && (
                    <form onSubmit={handleAddLabSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome do Laboratório / Infraestrutura</label>
                        <input 
                          type="text" 
                          required 
                          value={newLabName}
                          onChange={e => setNewLabName(e.target.value)}
                          placeholder="Ex: Laboratório de Biofotônica e RF Avançado"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Área de Concentração</label>
                        <input 
                          type="text" 
                          required
                          value={newLabArea}
                          onChange={e => setNewLabArea(e.target.value)}
                          placeholder="Ex: Biotecnologia / Telecom"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Equipamentos Críticos / Capacidades</label>
                        <textarea 
                          value={newLabEquip}
                          onChange={e => setNewLabEquip(e.target.value)}
                          placeholder="Ex: Analisador vetorial de redes ópticas, Cluster de processamento de borda Nvidia..."
                          rows={3}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all resize-none"
                        />
                      </div>
                      <div className="p-3 bg-slate-950/30 border border-slate-850 rounded-xl text-[10px] text-slate-400 flex items-center gap-2">
                        <Cpu className="text-emerald-400" size={16} />
                        <span>Equipamentos listados serão expostos como capacidades no IP Balcão.</span>
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-1.5"
                      >
                        <Cpu size={14} /> Homologar Infraestrutura
                      </button>
                    </form>
                  )}

                  {/* 5. ALLOCATE RESEARCHER */}
                  {activeModal === 'allocate_researcher' && modalData && (
                    <form onSubmit={handleAllocateResearcherSubmit} className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-slate-950/50 rounded-2xl border border-slate-850">
                        <img src={modalData.image} alt={modalData.name} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <h4 className="font-bold text-white text-sm">{modalData.name}</h4>
                          <p className="text-[10px] text-slate-500 font-semibold">{modalData.title}</p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Alocar no Projeto</label>
                        <select 
                          value={selectedProject}
                          onChange={e => setSelectedProject(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none focus:border-indigo-500 transition-all"
                        >
                          {recentProjects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dedicação Semanal</label>
                          <select 
                            value={allocationHours}
                            onChange={e => setAllocationHours(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-350 outline-none"
                          >
                            <option value="10">10h / semana</option>
                            <option value="20">20h / semana</option>
                            <option value="40">40h / semana (Exclusiva)</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Papel de Alocação</label>
                          <select 
                            value={allocationRole}
                            onChange={e => setAllocationRole(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-350 outline-none"
                          >
                            <option value="coordinator">Coordenador do Projeto</option>
                            <option value="researcher">Pesquisador Principal</option>
                            <option value="assistant">Assistente de P&D</option>
                          </select>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)] flex items-center justify-center gap-1.5"
                      >
                        <GraduationCap size={14} /> Confirmar Alocação Técnica
                      </button>
                    </form>
                  )}

                  {/* 6. EXPORT EMBRAPII REPORT */}
                  {activeModal === 'embrapit_report' && (
                    <div className="space-y-5">
                      <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-855 space-y-4">
                        <div className="flex justify-between items-center text-xs border-b border-slate-850 pb-2">
                          <span className="text-slate-400 font-semibold">Consumo EMBRAPII (2026):</span>
                          <span className="text-white font-mono font-bold">R$ 2.92M / R$ 4.50M (65%)</span>
                        </div>
                        <div className="flex justify-between items-center text-xs border-b border-slate-850 pb-2">
                          <span className="text-slate-400 font-semibold">Projetos em Execução:</span>
                          <span className="text-white font-bold">15 Projetos Ativos</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">Auditorias de Transações:</span>
                          <span className="text-emerald-400 font-bold">100% Auditável (Event Sourcing)</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ano Fiscal do Relatório</label>
                        <select 
                          value={fiscalYear}
                          onChange={e => setFiscalYear(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 outline-none"
                        >
                          <option value="2025">Ano Fiscal 2025</option>
                          <option value="2026">Ano Fiscal 2026 (Corrente)</option>
                          <option value="2027">Ano Fiscal 2027 (Previsão)</option>
                        </select>
                      </div>

                      <button 
                        onClick={handleExportEmbrapiiReport}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-1.5"
                      >
                        <Download size={14} /> Assinar e Gerar PDF Executivo
                      </button>
                    </div>
                  )}

                  {/* 7. CONSULT INVENTOR */}
                  {activeModal === 'consult_inventor' && (
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                          type="text" 
                          value={inventorQuery}
                          onChange={e => setInventorQuery(e.target.value)}
                          placeholder="Buscar pesquisador por nome ou linha..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>

                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {[
                          { name: "Prof. Dr. Rafael Silva", title: "Coordenador no CRR / Inatel", hIndex: 34, patents: 8, expertise: "Antenas inteligentes, Redes 5G/6G, Hardware RF", email: "rafael.silva@inatel.br" },
                          { name: "Dr. André Lourenço", title: "Pesquisador Sênior no WAI Lab", hIndex: 28, patents: 4, expertise: "Redes Neurais, IoT Industrial, Algoritmos de Borda", email: "andre.lourenco@inatel.br" },
                          { name: "Dra. Camila Santos", title: "Pesquisadora de Segurança Cibernética", hIndex: 22, patents: 12, expertise: "Segurança de Redes, Criptografia Pós-Quântica, IoT", email: "camila.santos@inatel.br" }
                        ]
                        .filter(i => i.name.toLowerCase().includes(inventorQuery.toLowerCase()) || i.expertise.toLowerCase().includes(inventorQuery.toLowerCase()))
                        .map((inv, idx) => (
                          <div key={idx} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-2 hover:border-slate-800 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-white text-xs">{inv.name}</h4>
                                <p className="text-[9px] text-slate-500 font-semibold">{inv.title}</p>
                              </div>
                              <span className="text-[8px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono text-slate-400">H-Index: {inv.hIndex}</span>
                            </div>
                            <p className="text-[10px] text-slate-450 leading-relaxed"><strong className="text-slate-350">Linha:</strong> {inv.expertise}</p>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-850/50 text-[9px]">
                              <span className="text-slate-500">{inv.email}</span>
                              <a href={`mailto:${inv.email}`} className="text-indigo-400 hover:underline font-bold uppercase tracking-wider">Entrar em Contato</a>
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
