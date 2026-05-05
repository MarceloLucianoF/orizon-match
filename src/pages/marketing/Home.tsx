import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="bg-[#020617] text-slate-200">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="font-semibold text-xl text-white tracking-tight">Orizon Match</span>

          <div className="flex gap-4 items-center">
            <Link to="/sobre" className="text-slate-400 hover:text-white transition">
              Sobre
            </Link>

            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition font-medium text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-cyan-400/10 to-transparent blur-3xl" />

        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          {/* 🔥 NOVO H1 */}
          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight text-white">
            Conecte sua inovação aos <br />
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              parceiros certos
            </span>
          </h1>

          <p className="mt-6 text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            O Orizon Match encontra empresas, investidores e centros de pesquisa
            ideais para o seu projeto — automaticamente.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/onboarding"
              className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition font-medium text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]"
            >
              Cadastrar minha ideia
            </Link>

            <Link
              to="/sobre"
              className="px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-500 transition text-slate-300 font-medium"
            >
              Como funciona
            </Link>
          </div>

          {/* SOCIAL PROOF */}
          <p className="mt-6 text-xs text-slate-500 uppercase tracking-widest font-semibold">
            +500 inovadores já conectando ideias ao mercado
          </p>
        </div>
      </section>

      {/* 🔥 MATCH VISUAL (PROVA) */}
      <section className="max-w-6xl mx-auto px-6 pb-24 relative z-10">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:shadow-[0_0_40px_rgba(99,102,241,0.25)] transition duration-500 max-w-lg mx-auto">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Match recomendado</p>

          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg text-white">AgroTech Labs</span>
              <span className="text-cyan-400 font-bold text-lg">82%</span>
            </div>

            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full w-[82%] bg-gradient-to-r from-indigo-500 to-cyan-400 animate-pulse" />
            </div>

            <p className="text-sm text-slate-400">
              Match forte por <span className="text-slate-200">mesma área</span> + <span className="text-slate-200">necessidade de investimento</span>
            </p>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="border-y border-slate-800/50 bg-slate-900/20 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-10">
          <div className="p-6 rounded-2xl bg-slate-800/20 border border-slate-800 hover:border-slate-700 transition">
            <h3 className="font-semibold text-white text-lg">Ideias travadas</h3>
            <p className="text-slate-400 mt-2 leading-relaxed">
              Falta conexão com quem pode executar e investir.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/20 border border-slate-800 hover:border-slate-700 transition">
            <h3 className="font-semibold text-white text-lg">Empresas sem pipeline</h3>
            <p className="text-slate-400 mt-2 leading-relaxed">
              Inovação fragmentada e difícil de acessar.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/20 border border-slate-800 hover:border-slate-700 transition">
            <h3 className="font-semibold text-white text-lg">Pesquisa isolada</h3>
            <p className="text-slate-400 mt-2 leading-relaxed">
              Sem conexão com o mercado real.
            </p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="text-center py-32 px-6 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          Comece em menos de 3 minutos
        </h2>

        <Link
          to="/login"
          className="inline-block mt-8 px-8 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition font-medium text-lg text-white shadow-[0_0_30px_rgba(79,70,229,0.4)]"
        >
          Criar meu projeto
        </Link>
      </section>
    </div>
  );
}
