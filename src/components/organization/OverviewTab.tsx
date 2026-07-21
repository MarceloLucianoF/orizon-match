import { 
  Coins, FileText, Zap, AlertTriangle, 
  ShieldCheck, Award, CheckCircle2, Briefcase, 
  Cpu, BarChart3, Plus
} from "lucide-react";

interface OverviewTabProps {
  stats: any;
  pendingAudits: any[];
  recentProjects: any[];
  challenges: any[];
  labs: any[];
  openModal: (type: string, data?: any) => void;
}

export function OverviewTab({
  stats,
  pendingAudits,
  recentProjects,
  challenges,
  labs,
  openModal
}: OverviewTabProps) {

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Capital Fomentado", val: "R$ 4.5M", desc: "Alocados via EMBRAPII", icon: <Coins className="text-emerald-400" />, color: "border-emerald-500/10" },
          { label: "Projetos no Portfólio", val: `${stats.totalProjects} Projetos`, desc: "Inovações de Hard Tech", icon: <FileText className="text-blue-400" />, color: "border-blue-500/10" },
          { label: "Deal Flows Ativos", val: `${stats.activeMatches} Matches`, desc: "Negociações abertas", icon: <Zap className="text-amber-400" />, color: "border-amber-500/10" },
          { label: "Auditorias Pendentes", val: `${pendingAudits.length} Projetos`, desc: "Validação técnica pendente", icon: <AlertTriangle className="text-teal-400" />, color: "border-teal-500/10" },
        ].map((stat, i) => (
          <div key={i} className={`bg-slate-900/40 border ${stat.color} p-6 rounded-3xl hover:border-slate-700 transition-all group relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-[40px] rounded-full -mr-12 -mt-12 group-hover:bg-white/10 transition-all" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 uppercase">
                Status OK
              </span>
            </div>
            <div className="text-2xl font-black text-white mb-0.5">{stat.val}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</div>
            <p className="text-[11px] text-slate-400 mt-2">{stat.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Validation Pipeline, Portfolio & Demand Feed */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Pipeline de Validação Técnica (Ação Exclusiva da ICT) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="text-teal-400" size={22} /> Pipeline de Validação Técnica (TRL)
              </h2>
              <span className="text-[9px] bg-teal-500/10 text-teal-400 px-2 py-1 rounded border border-teal-500/20 font-bold uppercase">
                Homologação ICT
              </span>
            </div>
            
            <div className="space-y-4">
              {pendingAudits.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/20 border border-slate-800 rounded-3xl">
                  <CheckCircle2 className="mx-auto text-emerald-400 mb-3" size={32} />
                  <p className="text-slate-400 text-sm font-semibold">Excelente! Todos os projetos do portfólio já estão validados pela ICT.</p>
                </div>
              ) : (
                pendingAudits.map(proj => (
                  <div key={proj.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{proj.title}</h4>
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] px-2 py-0.5 rounded font-black uppercase">
                          TRL {proj.declaredTRL || proj.maturity || 4} Declarado
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{proj.summary}</p>
                      <div className="flex gap-4 text-[10px] text-slate-500 mt-2">
                        <span>Inventor: <strong className="text-slate-300">Prof. Dr. Rafael Silva</strong></span>
                        <span>•</span>
                        <span>Linha de Fomento: <strong className="text-slate-300">{(proj.fundingTags && proj.fundingTags[0]) || "EMBRAPII"}</strong></span>
                      </div>
                    </div>
                    <button
                      onClick={() => openModal('validate_trl', proj)}
                      className="bg-teal-600/10 hover:bg-teal-600/20 text-teal-400 border border-teal-500/20 hover:border-teal-500/30 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
                    >
                      <Award size={14} /> Conceder Selo "ICT Verified"
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Portfólio de Projetos Homologados (Ativos) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="text-emerald-400" size={22} /> Portfólio de Projetos Homologados
              </h2>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 font-bold uppercase">
                Em Produção
              </span>
            </div>
            
            <div className="space-y-4">
              {recentProjects.filter(p => p.isIctVerified).length === 0 ? (
                <div className="p-8 text-center bg-slate-900/20 border border-slate-800 rounded-3xl">
                  <p className="text-slate-500 text-sm">Nenhum projeto homologado ainda.</p>
                </div>
              ) : (
                recentProjects.filter(p => p.isIctVerified).map(proj => (
                  <div key={proj.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all group">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm group-hover:text-teal-400 transition-colors">{proj.title}</h4>
                        <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[9px] px-2 py-0.5 rounded font-black uppercase">
                          TRL {proj.validatedTRL || proj.declaredTRL || 5} Validado
                        </span>
                        {proj.vdrStatus && (
                          <span className={`w-2 h-2 rounded-full ${
                            proj.vdrStatus === 'green' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' :
                            proj.vdrStatus === 'yellow' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' :
                            'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                          }`} title={`VDR Status: ${proj.vdrStatus}`} />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xl line-clamp-2">{proj.summary}</p>
                      <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 mt-2">
                        <span>Inventor: <strong className="text-slate-300">{proj.researcher || "Prof. Dr. Rafael Silva"}</strong></span>
                        <span>•</span>
                        <span>Segmento: <strong className="text-slate-300">{proj.segment}</strong></span>
                        <span>•</span>
                        <span>Patente: <strong className="text-slate-300">{proj.patentStatus || "Concedida"}</strong></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-xs font-bold text-teal-400 block">{proj.matchesCount || 0} Matches</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Inteligência Ativa</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Radar de Demanda (O que a Indústria quer comprar?) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="text-teal-400" size={22} /> Desafios Tecnológicos (Demandas de Indústrias)
              </h2>
              <span className="text-xs text-slate-500">Oportunidades de co-desenvolvimento</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map(chall => (
                <div key={chall.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-teal-500/20 transition-all group min-h-[200px]">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[9px] font-black uppercase text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded">
                        {chall.companyName}
                      </span>
                      <span className="text-emerald-400 font-mono text-xs font-bold">
                        R$ {(chall.budget / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-xs mt-3 leading-snug group-hover:text-teal-300 transition-colors">{chall.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-3 leading-relaxed">{chall.description}</p>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 mt-4 border-t border-slate-800/80 pt-2">
                    <span>Prazo: <strong className="text-slate-400">{chall.deadline}</strong></span>
                    <span className="text-teal-400 hover:underline cursor-pointer font-bold uppercase tracking-wider">Ver Match</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Insights, Fomento, Labs Occupancy & Segment Analytics */}
        <div className="space-y-8">
          
          {/* Card de Insights do Polo */}
          <div className="bg-gradient-to-br from-teal-600/20 via-slate-900 to-violet-600/15 p-6 rounded-3xl shadow-xl shadow-teal-600/10 space-y-4 relative overflow-hidden group border border-slate-800/80">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[30px] rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-all duration-500" />
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-teal-200">
              <Zap size={14} className="animate-pulse" /> Insight de Alta Conversão
            </div>
            <h3 className="font-extrabold text-white text-base leading-tight">Match de Alta Conversão Detectado</h3>
            <p className="text-teal-100/80 text-xs leading-relaxed">
              Há 5 grandes empresas buscando por "Conectividade 5G e IoT" este mês. Seu polo possui 2 projetos compatíveis em TRL 6/7.
            </p>
            <button 
              onClick={() => openModal('mass_notification')}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-semibold text-[10px] uppercase tracking-[0.12em] leading-none transition-all shadow-[0_0_18px_rgba(0,181,156,0.25)]"
            >
              Enviar Aviso Geral
            </button>
          </div>

          {/* Métricas de Fomento do Polo */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Orçamento Alocado por Linha</span>
              <span className="text-[9px] bg-slate-950 text-teal-400 px-2 py-0.5 rounded border border-slate-850 font-bold">Consumo 2026</span>
            </div>
            <div className="space-y-4">
              {[
                { label: "Unidade EMBRAPII", percent: 65, color: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" },
                { label: "FINEP Subvenção", percent: 40, color: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" },
                { label: "FAPEMIG/ANEEL Inova", percent: 85, color: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" },
              ].map(bar => (
                <div key={bar.label} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-300">{bar.label}</span>
                    <span className="text-slate-450 font-mono">{bar.percent}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                    <div className={`${bar.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${bar.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vitrine de Infraestrutura e Laboratórios */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Cpu className="text-slate-500" size={20} /> Ocupação de Infraestruturas
              </h2>
              <button 
                onClick={() => openModal('add_lab')}
                className="bg-teal-600/10 hover:bg-teal-600/20 text-teal-400 border border-teal-500/20 hover:border-teal-500/30 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 hover:scale-105 active:scale-95 animate-in fade-in"
              >
                <Plus size={12} /> Homologar
              </button>
            </div>
            
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-5">
              <div className="space-y-4">
                {labs.map(l => (
                  <div key={l.id} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-200 font-bold truncate max-w-[170px]">{l.name}</span>
                      <span className={`font-mono font-bold ${l.occupancy >= 80 ? 'text-rose-400' : 'text-emerald-400'}`}>{l.occupancy}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${l.occupancy >= 80 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${l.occupancy}%` }} 
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                      <span>{l.projectsCount} Projetos Alocados</span>
                      <span>Capacidade Máxima</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Radar de Demanda (Setores mais Buscados) */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-slate-500" size={20} /> Setores mais Buscados
            </h2>
            
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="space-y-3">
                {[
                  { label: "Telecom / 5G / 6G", percent: 45, color: "bg-teal-500" },
                  { label: "Internet das Coisas (IoT)", percent: 35, color: "bg-emerald-500" },
                  { label: "Inteligência Artificial", percent: 20, color: "bg-amber-500" }
                ].map(bar => (
                  <div key={bar.label} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-300">{bar.label}</span>
                      <span className="text-slate-500">{bar.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div className={`${bar.color} h-full rounded-full`} style={{ width: `${bar.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic text-center">
                Mapeamento em tempo real baseado nas queries e desafios postados pelas empresas.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
