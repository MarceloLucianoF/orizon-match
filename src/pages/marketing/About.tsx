import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function About() {
  return (
    <div className="bg-[#020617] text-slate-200 min-h-screen">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
            <ArrowLeft size={18} />
            <span className="font-semibold">Voltar para a Home</span>
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition font-medium text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]"
          >
            Entrar no App
          </Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-32 pb-24 space-y-16">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Por que o <br />
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Orizon Match
            </span> existe?
          </h1>
        </div>

        {/* O PORQUÊ */}
        <div className="space-y-6 text-slate-400 text-lg md:text-xl leading-relaxed font-light">
          <p>
            O maior problema da inovação não é falta de ideia. É falta de <span className="text-white font-medium">conexão certa</span>.
          </p>

          <p>
            Empresas procuram soluções que já existem e inventores criam tecnologias que nunca chegam ao mercado. Existe um vácuo imenso entre quem possui o problema, quem possui o capital e quem possui a solução.
          </p>

          <p>
            O Orizon Match elimina esse gap usando tecnologia e inteligência de dados para conectar quem precisa com quem pode resolver.
          </p>
        </div>

        {/* TESE */}
        <div className="grid md:grid-cols-2 gap-12 border-t border-slate-800 pt-16">
          <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800">
            <h3 className="text-white font-semibold text-xl mb-4">
              Nossa Tese
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Conexões não devem depender de sorte ou de ir a eventos aleatórios. Devem ser orientadas por dados, maturidade tecnológica real e fit estratégico de mercado.
            </p>
          </div>

          <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800">
            <h3 className="text-white font-semibold text-xl mb-4">
              Segurança e Confiança
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Protegemos propriedade intelectual ao garantir que você só conectará com pares pré-filtrados e estruturamos o primeiro contato de forma altamente profissional.
            </p>
          </div>
        </div>

        {/* VISÃO */}
        <div className="border-t border-slate-800 pt-16 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white tracking-tight">
            Nossa visão
          </h2>
          <p className="text-slate-400 text-xl font-light leading-relaxed max-w-2xl mx-auto">
            Criar o principal hub de inovação conectada da América Latina, onde ideias não ficam paradas na gaveta — elas evoluem e se tornam mercado.
          </p>
        </div>
        
        {/* CTA FINAL */}
        <div className="text-center pt-8">
          <Link
            to="/login"
            className="inline-block px-8 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition font-medium text-lg text-white shadow-[0_0_30px_rgba(79,70,229,0.4)]"
          >
            Faça parte dessa visão
          </Link>
        </div>
      </section>
    </div>
  );
}
