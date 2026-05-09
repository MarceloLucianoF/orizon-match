import { Link } from "react-router-dom";
import { Lightbulb, Building2, GraduationCap, ArrowRight, Zap, Shield, Users, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-[#020617] text-slate-200 overflow-x-hidden">

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
          <span className="font-black text-lg md:text-xl text-white tracking-tight">Orizon<span className="text-indigo-400">Match</span></span>
          <div className="flex gap-3 md:gap-4 items-center">
            <Link to="/sobre" className="text-slate-400 hover:text-white transition text-sm hidden sm:block">Como funciona</Link>
            <Link to="/login" className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition font-medium text-white text-sm shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-32 md:pt-40 pb-20 md:pb-28 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[900px] h-[400px] md:h-[600px] bg-gradient-to-b from-indigo-500/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 md:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold mb-6 md:mb-8 backdrop-blur-sm">
            <Zap size={14} className="fill-indigo-400" />
            Ecossistema de Inovação Aberta do Brasil
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white mb-5 md:mb-6">
            Sua inovação conectada{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              ao capital e à indústria certa.
            </span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed mb-3 md:mb-4">
            94% das patentes brasileiras nunca chegam ao mercado.
            O problema não é a ideia — é a{" "}
            <strong className="text-slate-200">falta de conexão com quem pode realizá-la.</strong>
          </p>
          <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-8 md:mb-10">
            O Orizon Match conecta automaticamente inventores, investidores e indústrias com base em compatibilidade real de segmento, maturidade tecnológica e capacidade produtiva.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
            <Link
              to="/onboarding"
              className="group px-6 md:px-8 py-3.5 md:py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 transition font-bold text-white shadow-[0_0_30px_rgba(79,70,229,0.4)] text-sm md:text-base flex items-center justify-center gap-2"
            >
              Cadastrar minha inovação
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/sobre"
              className="px-6 md:px-8 py-3.5 md:py-4 rounded-2xl border border-slate-700 hover:border-slate-500 transition text-slate-300 font-medium text-sm md:text-base text-center"
            >
              Ver como funciona
            </Link>
          </div>

          <p className="mt-6 md:mt-8 text-[10px] md:text-xs text-slate-600 uppercase tracking-widest font-semibold">
            Inventores · Startups · ICTs · Investidores · Indústrias
          </p>
        </div>
      </section>

      {/* A DOR EM 3 ATOS */}
      <section className="border-y border-slate-800/50 bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
          <p className="text-center text-[10px] md:text-xs uppercase tracking-[0.3em] text-slate-500 font-bold mb-10 md:mb-12">O problema que o Orizon resolve</p>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                icon: <Lightbulb className="text-amber-400" size={28} />,
                title: "O inventor tem a solução.",
                body: "Mas sem rede de contatos, sem capital e sem proteção jurídica, a inovação fica parada por anos.",
              },
              {
                icon: <Building2 className="text-emerald-400" size={28} />,
                title: "A indústria tem a demanda.",
                body: "Mas não encontra inovação no momento certo. Gasta fortunas com P&D interno sem garantia de retorno.",
              },
              {
                icon: <GraduationCap className="text-blue-400" size={28} />,
                title: "A universidade tem o conhecimento.",
                body: "Mas a pesquisa fica engavetada por falta de canal direto com o mercado e com investidores.",
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="p-5 md:p-6 rounded-2xl bg-slate-800/30 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition group">
                <div className="mb-4">{icon}</div>
                <h3 className="font-bold text-white text-base md:text-lg mb-2 group-hover:text-indigo-300 transition">{title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{body}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-300 font-semibold mt-10 md:mt-12 text-base md:text-lg">
            O Orizon Match conecta esses três mundos — automaticamente.
          </p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight mb-4">Para cada perfil, uma jornada</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">O sistema adapta a experiência conforme o seu papel no ecossistema.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            {
              icon: <Lightbulb size={28} className="text-amber-400" />,
              role: "Inventor / Startup",
              steps: [
                "Descreve sua inovação e nível de maturidade (TRL)",
                "Define o que precisa: capital, P&D ou capacidade industrial",
                "Recebe matches automáticos de parceiros compatíveis",
                "Inicia negociação protegida por NDA digital",
              ],
            },
            {
              icon: <Building2 size={28} className="text-emerald-400" />,
              role: "Empresa / Investidor",
              steps: [
                "Define sua tese de investimento e TRL alvo",
                "Recebe projetos já filtrados por compatibilidade real",
                "Acessa o pipeline visual de Deal Flow",
                "Fecha acordos com documentação auditada",
              ],
            },
            {
              icon: <GraduationCap size={28} className="text-blue-400" />,
              role: "ICT / Universidade",
              steps: [
                "Cadastra laboratórios e linhas de pesquisa",
                "Conecta com startups que precisam de P&D",
                "Gerencia transferência tecnológica",
                "Expande o impacto da pesquisa acadêmica",
              ],
            },
          ].map(({ icon, role, steps }) => (
            <div key={role} className="bg-slate-900/50 border border-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-7 hover:border-slate-700 transition group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 md:mb-5 group-hover:scale-110 transition-transform">
                {icon}
              </div>
              <h3 className="font-bold text-white text-lg md:text-xl mb-4 md:mb-5">{role}</h3>
              <ol className="space-y-2.5 md:space-y-3">
                {steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-300 mt-0.5">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <Link to="/onboarding" className="mt-5 md:mt-6 flex items-center gap-1 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition group/link">
                Começar agora <ChevronRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST SIGNALS */}
      <section className="border-t border-slate-800/50 bg-slate-900/20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 grid md:grid-cols-3 gap-6 md:gap-8 text-center">
          {[
            { icon: <Shield className="text-emerald-400 mx-auto mb-3" size={28} />, title: "Propriedade Intelectual protegida", body: "Dados do projeto bloqueados por NDA digital. Acesso ao Data Room somente após verificação." },
            { icon: <Zap className="text-indigo-400 mx-auto mb-3" size={28} />, title: "Algoritmo de compatibilidade real", body: "Pontuação baseada em TRL, IRL, segmento FIESC, localização e capacidade. Sem spam, sem ruído." },
            { icon: <Users className="text-cyan-400 mx-auto mb-3" size={28} />, title: "Modelo Tríplice Hélice", body: "Inventores, ICTs e Empresas no mesmo ecossistema. O modelo reconhecido de inovação aplicada." },
          ].map(({ icon, title, body }) => (
            <div key={title} className="p-4 md:p-6">
              {icon}
              <h4 className="font-bold text-white text-sm md:text-base mb-2">{title}</h4>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="text-center py-24 md:py-36 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Sua inovação está esperando<br />
            <span className="text-indigo-400">o parceiro certo.</span>
          </h2>
          <p className="text-slate-400 text-base md:text-lg mb-8 md:mb-10 max-w-md mx-auto">
            Cadastre em menos de 3 minutos. O algoritmo encontra as conexões ideais para você.
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
      <footer className="border-t border-slate-800/50 py-6 md:py-8 text-center text-slate-600 text-xs md:text-sm px-4">
        <p>© 2025 Orizon Match · Ecossistema de Inovação Aberta · <Link to="/sobre" className="hover:text-slate-400 transition">Sobre</Link></p>
      </footer>

    </div>
  );
}
