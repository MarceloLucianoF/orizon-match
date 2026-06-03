import { useOrganizationDashboard } from "../../hooks/useOrganizationDashboard";
import { OverviewTab } from "../../components/organization/OverviewTab";
import { CapacitiesTab } from "../../components/organization/CapacitiesTab";
import { FomentoTab } from "../../components/organization/FomentoTab";
import { ResearchersTab } from "../../components/organization/ResearchersTab";
import { IpBalcaoTab } from "../../components/organization/IpBalcaoTab";
import { Building2, Search } from "lucide-react";
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
          <button className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-slate-400 text-sm font-bold flex items-center gap-2 hover:text-white transition-all">
             <Search size={18} /> Consultar Inventor
          </button>
          <button 
            onClick={() => alert("Relatório de fomento executivo exportado para PDF!")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all"
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
          handleValidateTRL={handleValidateTRL}
          setActiveTab={setActiveTab}
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
        <FomentoTab fundingCalls={fundingCalls} />
      )}

      {activeTab === "researchers" && (
        <ResearchersTab 
          researchersSearch={researchersSearch}
          setResearchersSearch={setResearchersSearch}
          filteredResearchers={filteredResearchers}
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
    </div>
  );
}
