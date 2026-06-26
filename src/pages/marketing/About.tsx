import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Target, Users, Handshake } from "lucide-react";

export default function About() {
  return (
    <div className="bg-[#020617] text-slate-200 min-h-screen">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
            <ArrowLeft size={18} />
            <span className="font-semibold text-sm">Voltar</span>
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition font-medium text-white text-sm shadow-[0_0_15px_rgba(79,70,229,0.3)]"
          >
            Entrar
          </Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 md:px-6 pt-28 md:pt-32 pb-20 md:pb-24 space-y-12 md:space-y-16">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Por que o <br />
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Orizon Match
            </span> existe?
          </h1>
        </div>

        {/* O PORQUÊ */}
        <div className="space-y-5 md:space-y-6 text-slate-400 text-base md:text-lg lg:text-xl leading-relaxed font-light">
          <p>
            O maior problema da inovação no Brasil não é a falta de ideias. É a falta de <span className="text-white font-medium">conexão estratégica</span>.
          </p>
          <p>
            Empresas buscam soluções tecnológicas que já existem. Inventores criam tecnologias que nunca alcançam o mercado. Universidades produzem pesquisas que permanecem engavetadas. Existe um gap imenso entre quem possui o problema, quem possui o capital e quem possui a solução.
          </p>
          <p>
            O Orizon Match elimina esse gap usando algoritmos de compatibilidade e dados de maturidade tecnológica (TRL/IRL) para conectar os agentes certos no momento certo.
          </p>
        </div>

        {/* TESE + SEGURANÇA */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 border-t border-slate-800 pt-12 md:pt-16">
          <div className="bg-slate-900/40 p-6 md:p-8 rounded-2xl border border-slate-800/80 hover:border-indigo-500/20 hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-sm shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-indigo-400" size={24} />
              <h3 className="text-white font-bold text-lg md:text-xl tracking-tight">Nossa Tese</h3>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base">
              Conexões de inovação não devem depender de networking aleatório. Devem ser orientadas por dados reais: maturidade tecnológica, fit de segmento e capacidade produtiva. Isso é o que chamamos de <strong className="text-slate-200 font-semibold">matchmaking de precisão</strong>.
            </p>
          </div>

          <div className="bg-slate-900/40 p-6 md:p-8 rounded-2xl border border-slate-800/80 hover:border-indigo-500/20 hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-sm shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-emerald-400" size={24} />
              <h3 className="text-white font-bold text-lg md:text-xl tracking-tight">Segurança e Confiança</h3>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base">
              Protegemos propriedade intelectual com NDA digital e Data Room Virtual auditado. O primeiro contato é estruturado de forma profissional, blindando inventor e investidor.
            </p>
          </div>
        </div>

        {/* MODELO */}
        <div className="border-t border-slate-800 pt-12 md:pt-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-white tracking-tight text-center">
            Modelo de Operação
          </h2>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: <Users className="text-cyan-400" size={24} />, title: "Tríplice Hélice", desc: "Inventores, ICTs e Empresas conectados no mesmo ecossistema digital, modelo reconhecido internacionalmente." },
              { icon: <Handshake className="text-amber-400" size={24} />, title: "Parceiro Curadoria", desc: "Escritórios jurídicos convidados validam documentação, gerando selo de aptidão para investidores." },
              { icon: <Target className="text-indigo-400" size={24} />, title: "Alinhamento FIESC", desc: "Segmentos mapeados pelas Câmaras da FIESC garantem classificação industrial precisa e relevante." },
            ].map(item => (
              <div key={item.title} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/20 hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-sm shadow-card">
                <div className="mb-3.5">{item.icon}</div>
                <h4 className="text-white font-bold text-sm md:text-base mb-2.5 tracking-tight">{item.title}</h4>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* VISÃO */}
        <div className="border-t border-slate-800 pt-12 md:pt-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-white tracking-tight">
            Nossa visão
          </h2>
          <p className="text-slate-400 text-base md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
            Ser o principal hub de inovação conectada da América Latina, onde ideias deixam de ser gaveta e se tornam mercado, capital e impacto real.
          </p>
        </div>
        
        {/* CTA FINAL */}
        <div className="text-center pt-6 md:pt-8">
          <Link
            to="/onboarding"
            className="inline-block px-6 md:px-8 py-3.5 md:py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition font-medium text-base md:text-lg text-white shadow-[0_0_30px_rgba(79,70,229,0.4)]"
          >
            Faça parte desse ecossistema
          </Link>
        </div>
      </section>
    </div>
  );
}
