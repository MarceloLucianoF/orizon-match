import { Link } from "react-router-dom";
import { 
  Lightbulb, 
  ArrowRight, 
  Users, 
  Lock, 
  Eye, 
  FileCheck, 
  Cpu, 
  Sparkles,
  Search,
  CheckCircle2,
  Network,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  GraduationCap,
  Building2
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-[#030712] text-slate-100 min-h-screen overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-[#030712]/80 backdrop-blur-xl border-b border-slate-800/40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3.5 flex justify-between items-center">
          <Link to="/" className="font-black text-xl text-white tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]">O</span>
            Orizon <span className="text-indigo-400 text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 tracking-wider">PLATFORM</span>
          </Link>
          <div className="flex gap-4 items-center">
            <Link to="/sobre" className="text-slate-400 hover:text-white transition text-sm hidden sm:block">Como funciona</Link>
            <Link to="/login" className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition font-semibold text-slate-300 text-sm">
              Entrar
            </Link>
            <Link to="/onboarding" className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition font-semibold text-white text-sm shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              Cadastrar
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-32 md:pt-44 pb-20 md:pb-24 relative overflow-hidden">
        {/* Soft atmospheric gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[900px] h-[400px] md:h-[600px] bg-gradient-to-b from-indigo-500/20 via-violet-500/10 to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 md:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold mb-6 backdrop-blur-md">
            <Sparkles size={14} className="text-indigo-400" />
            IA que reduz semanas de prospecção tecnológica para minutos
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white mb-6">
            A plataforma de transferência tecnológica{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              segura e inteligente.
            </span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
            Conectamos universidades, inventores e indústrias em um ambiente transacional blindado. 
            Identifique ativos de propriedade intelectual compatíveis com sua tese de inovação e negocie sob NDAs automáticos.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
            <Link
              to="/onboarding"
              className="group px-8 py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 transition font-bold text-white shadow-[0_0_30px_rgba(79,70,229,0.4)] text-sm md:text-base flex items-center justify-center gap-2"
            >
              Iniciar transferência tecnológica
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/sobre"
              className="px-8 py-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition text-slate-300 font-semibold text-sm md:text-base text-center"
            >
              Verificar segurança do VDR
            </Link>
          </div>

          <div className="border-t border-slate-800/60 pt-8 max-w-3xl mx-auto flex flex-wrap justify-center gap-x-12 gap-y-4 text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>✓ Conectado a +3.000 Patentes de ICTs</span>
            <span>✓ Em conformidade com a Lei de Inovação</span>
            <span>✓ VDR com auditoria militar e LGPD</span>
          </div>
        </div>
      </section>

      {/* O PROBLEMA (O GARGALO DA INOVAÇÃO APLICADA) */}
      <section className="border-y border-slate-800/40 bg-slate-950/40 relative">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">O Gargalo Tecnológico</span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-2 mb-4">
              Por que a transferência de tecnologia falha hoje?
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              A distância de linguagem e a falta de garantias jurídicas de confidencialidade geram atrito nos três pilares do ecossistema.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: <Lightbulb className="text-amber-400" size={28} />,
                title: "Pesquisas Universitárias Engavetadas",
                body: "NITs e acadêmicos possuem patentes altamente inovadoras, mas sofrem sem canais comerciais e linguagem de negócios para acessar o mercado.",
              },
              {
                icon: <Briefcase className="text-emerald-400" size={28} />,
                title: "Desperdício de P&D nas Indústrias",
                body: "Empresas gastam fortunas tentando criar tecnologias do zero por não encontrarem soluções e patentes já validadas em laboratórios acadêmicos.",
              },
              {
                icon: <Lock className="text-pink-400" size={28} />,
                title: "Medo de Exposição de Propriedade Intelectual",
                body: "Inventores e corporações hesitam em iniciar conversas por falta de um ambiente seguro e de NDAs robustos que protejam segredos comerciais.",
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="p-6 md:p-8 rounded-2xl bg-slate-900/20 border border-slate-800 hover:border-slate-700/60 hover:bg-slate-900/40 transition duration-300">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center mb-6">
                  {icon}
                </div>
                <h3 className="font-bold text-white text-lg mb-3">{title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIAGRAMA DO ECOSSISTEMA */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-24 relative text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/5 blur-[120px] pointer-events-none" />
        
        <div className="max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Integração Total</span>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-2 mb-4">
            Um Ecossistema Conectado e Seguro
          </h2>
          <p className="text-slate-400 text-sm">
            O Orizon Match orquestra o fluxo de transações entre todas as pontas da inovação.
          </p>
        </div>

        {/* Ecosystem CSS Diagram */}
        <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-slate-950/30 border border-slate-900 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-4 relative overflow-hidden">
          
          {/* Node 1: ICTs */}
          <div className="flex flex-col items-center p-5 rounded-2xl border border-slate-800 bg-slate-900/60 w-52 relative z-10">
            <GraduationCap className="text-blue-400 w-8 h-8 mb-2" />
            <h4 className="font-bold text-white text-sm">ICTs & NITs</h4>
            <p className="text-slate-500 text-[10px] mt-1 text-center">Portfólios de Patentes e Linhas de Pesquisa</p>
          </div>

          {/* Connection vector 1 */}
          <div className="hidden md:block flex-1 h-[2px] bg-gradient-to-r from-blue-500/20 to-indigo-500 z-0" />

          {/* Central Hub: Orizon */}
          <div className="flex flex-col items-center p-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 w-60 relative z-10 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
            <Network className="text-indigo-400 w-10 h-10 mb-2 animate-pulse" />
            <h3 className="font-black text-white text-base">ORIZON MATCH</h3>
            <p className="text-indigo-300 text-[10px] mt-1 text-center font-semibold">Motor de IA e VDR Blindado</p>
          </div>

          {/* Connection vector 2 */}
          <div className="hidden md:block flex-1 h-[2px] bg-gradient-to-r from-indigo-500 to-emerald-500/20 z-0" />

          {/* Node 2: Empresas */}
          <div className="flex flex-col items-center p-5 rounded-2xl border border-slate-800 bg-slate-900/60 w-52 relative z-10">
            <Building2 className="text-emerald-400 w-8 h-8 mb-2" />
            <h4 className="font-bold text-white text-sm">Indústrias & Investidores</h4>
            <p className="text-slate-500 text-[10px] mt-1 text-center">Teses de Inovação e Demandas de Mercado</p>
          </div>
        </div>
      </section>

      {/* DEMONSTRAÇÃO DO MATCHING POR IA */}
      <section className="bg-slate-950/60 border-y border-slate-800/40 relative">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-24">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Matchmaking de Precisão</span>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-2 mb-6">
                Como nossa IA cruza demandas e patentes
              </h2>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-6">
                Não cruzamos apenas palavras-chave. Nosso algoritmo semântico analisa o potencial tecnológico dos projetos de pesquisa cadastrados pelas universidades e o confronta com a tese de investimento declarada pela indústria, medindo a maturidade real (TRL).
              </p>
              <div className="space-y-4 text-xs md:text-sm">
                <div className="flex gap-3">
                  <CheckCircle2 className="text-indigo-400 flex-shrink-0" size={18} />
                  <span>Análise semântica profunda de patentes do INPI</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="text-indigo-400 flex-shrink-0" size={18} />
                  <span>Cálculo automático de compatibilidade técnica</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="text-indigo-400 flex-shrink-0" size={18} />
                  <span>Geração instantânea de roadmaps de integração</span>
                </div>
              </div>
            </div>

            {/* Simulated Match Interface Dashboard */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <span className="text-xs font-bold text-slate-400 tracking-wider">Mecanismo de IA Orizon</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-5">
                {/* Demand Input */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="text-emerald-400 w-4 h-4" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tese de Demanda (Indústria de Energia)</span>
                  </div>
                  <p className="text-xs text-slate-300">"Buscamos novas tecnologias de catalisadores para a produção de hidrogênio verde de alta eficiência por eletrólise da água."</p>
                </div>

                {/* IA Calculating animation visual */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-[1px] bg-dashed bg-slate-800" />
                  <div className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold flex items-center gap-1.5">
                    <Cpu size={12} className="animate-spin" />
                    Matcher IA processando afinidade semântica...
                  </div>
                  <div className="flex-1 h-[1px] bg-dashed bg-slate-800" />
                </div>

                {/* Match Result Card */}
                <div className="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/30 flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="text-blue-400 w-4 h-4" />
                      <span className="text-[10px] font-bold text-blue-300 uppercase">Universidade Federal de Minas Gerais (UFMG)</span>
                    </div>
                    <h4 className="font-bold text-white text-xs md:text-sm">BR10202500010: Reator Catalítico Integrado com Nanopartículas Estruturadas</h4>
                    <p className="text-[11px] text-slate-400">Patente depositada de catalisador de transição capaz de elevar em 28% a taxa de hidrogênio gerado.</p>
                    <div className="flex gap-3 text-[10px] pt-1">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-indigo-300 font-semibold">TRL 6 (Modelo Funcional)</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-emerald-300 font-semibold">NDA Disponível</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">AFINIDADE</span>
                    <span className="text-2xl md:text-3xl font-black text-indigo-400">92%</span>
                    <span className="block mt-2 px-2 py-1 bg-indigo-500/20 text-indigo-300 text-[9px] font-bold rounded uppercase tracking-wider text-center">
                      Recomendado
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* COMPARAÇÃO IMPLÍCITA (TABELA) */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Por que o Orizon?</span>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-2 mb-4">
            Comparativo de Eficiência Transacional
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            O processo tradicional de transferência de tecnologia é lento e inseguro. Nós redesenhamos essa jornada.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Tradicional */}
          <div className="bg-slate-950/20 border border-slate-900 rounded-3xl p-6 md:p-8">
            <h3 className="font-bold text-slate-500 text-lg mb-6 flex items-center justify-between">
              Processo Tradicional
              <ArrowUpRight size={18} className="text-slate-700" />
            </h3>
            <ul className="space-y-4 text-xs md:text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-0.5">✕</span>
                <span>Prospecção manual de patentes via palavras-chave exatas</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-0.5">✕</span>
                <span>Assinatura manual de NDAs físicos (dias ou semanas de trâmite)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-0.5">✕</span>
                <span>Envio inseguro de PDFs e projetos por e-mail ou nuvem pública</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-0.5">✕</span>
                <span>Sem controle de quem leu os dados ou fez download</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-0.5">✕</span>
                <span>Sem tradução de valor técnico para linguagem comercial</span>
              </li>
            </ul>
          </div>

          {/* Orizon Match */}
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-6 md:p-8 shadow-[0_0_30px_rgba(79,70,229,0.05)]">
            <h3 className="font-bold text-indigo-400 text-lg mb-6 flex items-center justify-between">
              Com Orizon Match
              <Sparkles size={18} className="text-indigo-400" />
            </h3>
            <ul className="space-y-4 text-xs md:text-sm text-slate-200">
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>**Matchmaking Semântico**: IA cruza ideias a demandas reais</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>**Smart NDAs Clickwrap**: Assinaturas digitais em 1 clique</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>**Data Room Seguro (VDR)**: Documentos blindados e protegidos</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>**Trilha de Auditoria**: Telemetria de acessos por segundo</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>**IA Pitch Enhancer**: Ciência traduzida para negócios</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* PROPRIEDADE INTELECTUAL E VDR HARDENING */}
      <section className="bg-slate-950/40 border-y border-slate-800/40 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.03),transparent_40%)]" />
        
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Segurança de Dados e IP (LegalTech)</span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-2 mb-4">
              Blindagem completa de segredos comerciais
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              Desenvolvemos os mecanismos necessários para mitigar qualquer possibilidade de vazamento de propriedade intelectual sensível.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <FileCheck className="text-emerald-400" size={26} />,
                title: "Smart NDAs Clickwrap",
                desc: "Anexos e especificações confidenciais são restritos e borrados visualmente no Explore até que o usuário assine digitalmente um termo de confidencialidade vinculante."
              },
              {
                icon: <Lock className="text-emerald-400" size={26} />,
                title: "Virtual Data Room (VDR)",
                desc: "Arquivos sensíveis abrem em nosso visualizador seguro que desativa de forma nativa atalhos de impressão, cópia (`Ctrl+C`/`Ctrl+P`) ou downloads não autorizados."
              },
              {
                icon: <Eye className="text-emerald-400" size={26} />,
                title: "Marca d'água Dinâmica",
                desc: "Cada documento recebe uma marca d'água diagonal personalizada com o E-mail, IP e Session ID do visualizador, garantindo rastreamento visual."
              },
              {
                icon: <Users className="text-emerald-400" size={26} />,
                title: "Telemetria de Leitura",
                desc: "Monitoramos e salvamos em um log de auditoria imutável o tempo exato de leitura (`view.start` / `view.end`) de cada página por cada ator."
              }
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/30 transition duration-300">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center mb-5">
                  {icon}
                </div>
                <h3 className="font-bold text-white text-base md:text-lg mb-3">{title}</h3>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TUDO EM UM SÓ LUGAR (BENTO GRID DE RECURSOS) */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Tudo em um só lugar</span>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-2 mb-4">
            A infraestrutura completa de transferência
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Uma plataforma integrada de ponta a ponta que cobre desde a ideação do projeto ao fechamento comercial.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Cpu size={22} className="text-indigo-400" />,
              title: "IA de Análise de Patentes",
              desc: "Otimiza a leitura e a conversão de textos de patentes complexas em linguagem comercial."
            },
            {
              icon: <Search size={22} className="text-indigo-400" />,
              title: "Matching Semântico",
              desc: "Recomendações automáticas conectando teses de indústrias e projetos científicos."
            },
            {
              icon: <BarChart3 size={22} className="text-indigo-400" />,
              title: "Gestão de Portfólio (NITs)",
              desc: "Painel exclusivo para NITs acadêmicos monitorarem o andamento do portfólio de pesquisas da instituição."
            },
            {
              icon: <Lock size={22} className="text-indigo-400" />,
              title: "Virtual Data Room (VDR)",
              desc: "Espaço seguro de documentação técnica com criptografia e proteção contra downloads."
            },
            {
              icon: <FileCheck size={22} className="text-indigo-400" />,
              title: "Smart NDAs integrados",
              desc: "Acordos Clickwrap com log de auditoria jurídica imediato e rastreabilidade."
            },
            {
              icon: <Users size={22} className="text-indigo-400" />,
              title: "Organizações Multi-institucionais",
              desc: "Acesso multi-tenant para administradores simularem papéis e gerenciarem dezenas de membros."
            }
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-slate-900/30 border border-slate-800 hover:border-slate-700/60 rounded-2xl p-6 transition duration-300">
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center mb-4">
                {icon}
              </div>
              <h3 className="font-bold text-white text-sm md:text-base mb-2">{title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="text-center py-24 md:py-36 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Acelere a transferência tecnológica<br />
            <span className="text-indigo-400">com total segurança.</span>
          </h2>
          <p className="text-slate-400 text-base md:text-lg mb-8 md:mb-10 max-w-xl mx-auto">
            Cadastre sua patente ou declare sua tese. Conecte-se ao ecossistema e feche parcerias auditadas.
          </p>
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 transition font-bold text-base md:text-lg text-white shadow-[0_0_40px_rgba(79,70,229,0.4)]"
          >
            Cadastrar minha inovação <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/50 py-8 text-center text-slate-500 text-xs md:text-sm px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-bold text-white">Orizon</span>
          <p>© 2026 Orizon · Plataforma de Transferência Tecnológica Segura · <Link to="/sobre" className="hover:text-slate-300 transition">Sobre</Link></p>
        </div>
      </footer>

    </div>
  );
}
