import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="bg-bg text-text">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-bg via-bgSoft to-bg px-6 py-24 text-center shadow-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_28%)]" />

        <div className="relative mx-auto max-w-3xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
            Matchmaking orientado por dados
          </p>

          <h1 className="text-5xl font-bold leading-tight text-text md:text-6xl">
            Onde ideias encontram execução.
          </h1>

          <p className="mx-auto text-lg text-muted md:text-xl">
            Plataforma inteligente para conectar inventores, investidores, ICTs e indústria com precisão e confiança.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="rounded-xl bg-orizon-gradient px-8 py-4 text-base font-semibold text-white shadow-glow transition hover:opacity-90"
            >
              Criar projeto
            </Link>

            <Link
              to="/explore"
              className="rounded-xl border border-border bg-surface/80 px-8 py-4 text-base font-semibold text-text shadow-card backdrop-blur-xl transition hover:border-primary/30 hover:text-white"
            >
              Explorar oportunidades
            </Link>
          </div>

          <div className="mx-auto mt-12 grid max-w-2xl gap-3 rounded-2xl border border-border bg-surface/80 p-6 text-left shadow-card backdrop-blur-xl">
            <p className="text-sm font-medium text-muted">Preview de match gerado automaticamente</p>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-text">Projeto Energia Sustentavel</span>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-bold text-accent">82%</span>
            </div>

            <div className="flex flex-wrap gap-2 text-sm text-muted">
              <span className="rounded-full border border-border bg-surface2 px-3 py-1">Investidor compatível</span>
              <span className="rounded-full border border-border bg-surface2 px-3 py-1">Laboratório disponível</span>
              <span className="rounded-full border border-border bg-surface2 px-3 py-1">Mesmo segmento</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-text">Para quem é o Orizon Match</h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-muted">
              Um ecossistema de colaboração para quem precisa transformar inovação em execução.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {["Inventores", "Investidores", "Indústria", "Universidades"].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border bg-surface/80 p-6 text-center font-semibold text-text shadow-card backdrop-blur-xl transition hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface2/80 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-text">Como funciona</h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-muted">
              Fluxo direto para acelerar conexões com potencial real de parceria.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur-xl transition hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <h3 className="text-xl font-semibold text-text">Crie seu projeto</h3>
              <p className="mt-3 text-sm text-muted">
                Descreva sua ideia com um fluxo progressivo, claro e orientado por match.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur-xl transition hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <h3 className="text-xl font-semibold text-text">Receba matches</h3>
              <p className="mt-3 text-sm text-muted">
                O sistema classifica parceiros por score, contexto e intenção de colaboração.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur-xl transition hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <h3 className="text-xl font-semibold text-text">Conecte-se</h3>
              <p className="mt-3 text-sm text-muted">
                Interaja com confiança e avance para conversas e parcerias reais.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-bg via-bgSoft to-bg px-6 py-24 text-center">
        <div className="mx-auto max-w-4xl space-y-6">
          <h2 className="text-3xl font-bold text-text">Não é busca. É matchmaking inteligente.</h2>
          <p className="text-lg text-muted">
            Nosso algoritmo analisa dados para conectar você com os parceiros ideais, economizando tempo e
            aumentando suas chances de sucesso.
          </p>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-text">Veja como os matches aparecem</h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-muted">
              Decisão orientada por score explicável, afinidade real e contexto de execução.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { title: "Energia Sustentavel", match: "82%" },
              { title: "Agrotech Inteligente", match: "76%" },
              { title: "Saude Digital", match: "89%" },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur-xl transition hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]"
              >
                <h3 className="font-semibold text-text">{item.title}</h3>

                <span className="mt-4 inline-block rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
                  {item.match} Match
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-text md:text-4xl">Comece agora e encontre o parceiro ideal.</h2>

        <p className="mt-4 text-lg text-muted">Transforme sua ideia em algo real com as conexões certas.</p>

        <Link
          to="/register"
          className="mt-8 inline-block rounded-xl bg-orizon-gradient px-8 py-4 font-semibold text-white shadow-glow transition hover:opacity-90"
        >
          Criar projeto
        </Link>
      </section>
    </div>
  );
}
