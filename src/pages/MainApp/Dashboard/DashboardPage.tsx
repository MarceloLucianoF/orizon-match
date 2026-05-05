import { useMemo } from "react";
import {
  calculateMatchScore,
  classifyMatch,
  generateMatchExplanation,
  getScoreTone,
} from "../../../lib/matching";
import type { Project, User } from "../../../types";

function scoreBadgeClass(score: number): string {
  const tone = getScoreTone(score);

  if (tone === "high") {
    return "bg-emerald-500/10 text-emerald-300";
  }

  if (tone === "medium") {
    return "bg-amber-500/10 text-amber-300";
  }

  return "bg-rose-500/10 text-rose-300";
}

export default function DashboardPage() {
  const project: Project = {
    id: "project-1",
    userId: "user-1",
    userName: "Joao Silva",
    title: "App de economia com IA",
    description: "Aplicativo mobile para gerenciar financas pessoais usando IA",
    segmento: "tecnologia",
    maturidade: "mvp",
    tipo: "inovacao",
    precisa: ["investidor", "ict"],
    localizacao: { cidade: "Florianopolis", estado: "SC" },
    status: "publicado",
    summaryMethod: "guiado",
    views: 0,
    matches: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const users: User[] = [
    {
      id: "user-2",
      uid: "fb-user-2",
      email: "investidor@example.com",
      displayName: "Maria Investidora",
      tipo: "investidor",
      segmentosInteresse: ["tecnologia"],
      interessesMaturidade: ["mvp", "produto"],
      localizacao: { cidade: "Florianopolis", estado: "SC" },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "user-3",
      uid: "fb-user-3",
      email: "ict@example.com",
      displayName: "Prof. Carlos (UFSC)",
      tipo: "ict",
      segmentosInteresse: ["tecnologia"],
      interessesMaturidade: ["ideia", "prototipo"],
      localizacao: { cidade: "Florianopolis", estado: "SC" },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "user-4",
      uid: "fb-user-4",
      email: "industria@example.com",
      displayName: "Industria XYZ",
      tipo: "industria",
      segmentosInteresse: ["metal"],
      interessesMaturidade: ["produto"],
      localizacao: { cidade: "Sao Paulo", estado: "SP" },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const results = useMemo(
    () =>
      users
        .map((user) => {
          const result = calculateMatchScore(project, user);

          return {
            user,
            result,
            classification: classifyMatch(result.score),
            reasons: generateMatchExplanation(result, project, user),
          };
        })
        .sort((left, right) => right.result.score - left.result.score),
    [project, users],
  );

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-bg via-bgSoft to-bg p-6 shadow-card md:p-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Dashboard</p>
          <h1 className="text-4xl font-bold text-text md:text-5xl">Seus matches em um painel claro e premium.</h1>
          <p className="text-lg text-muted">
            Ranking automático, score explicável e próximas ações para transformar interesse em parceria.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface/80 p-5 backdrop-blur-xl">
            <p className="text-sm text-muted">Projetos ativos</p>
            <h2 className="mt-2 text-3xl font-bold text-text">12</h2>
          </div>

          <div className="rounded-2xl border border-border bg-surface/80 p-5 backdrop-blur-xl">
            <p className="text-sm text-muted">Matches encontrados</p>
            <h2 className="mt-2 text-3xl font-bold text-accent">38</h2>
          </div>

          <div className="rounded-2xl border border-border bg-surface/80 p-5 backdrop-blur-xl">
            <p className="text-sm text-muted">Taxa média</p>
            <h2 className="mt-2 text-3xl font-bold text-primary">72%</h2>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur-xl md:p-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-text">Projeto atual</h2>
            <p className="mt-2 text-muted">Segmento: Tecnologia • MVP • Busca investimento e ICT</p>
          </div>
          <p className="text-sm text-muted">Atualizado agora</p>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-text">Matches recomendados</h2>
          <p className="text-sm text-muted">Ordenados do maior para o menor score</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {results.map((match) => (
            <div
              key={match.user.id}
              className="relative rounded-2xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur-xl transition hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-text">
                  {match.user.displayName}
                </h3>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${scoreBadgeClass(match.result.score)}`}
                >
                  {match.result.score}% Match
                </span>
              </div>

              <p className="mt-2 text-sm capitalize text-muted">{match.user.tipo}</p>

              <div className="mt-4">
                <p className="text-sm font-medium text-text">
                  Por que esse match?
                </p>

                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {match.reasons.map((reason, index) => (
                    <li key={`${match.user.id}-${index}`}>✔ {reason}</li>
                  ))}
                </ul>

                <p className="mt-3 text-sm font-medium text-text">
                  {match.classification}
                </p>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface2">
                  <div
                    className="h-full rounded-full bg-orizon-gradient"
                    style={{ width: `${match.result.score}%` }}
                  />
                </div>
              </div>

              <button className="mt-6 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:opacity-90">
                Tenho interesse
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur-xl md:p-8">
        <h2 className="text-xl font-semibold text-text">Como o match é calculado</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          O algoritmo considera aderência de segmento, necessidade de investimento, maturidade tecnológica e
          proximidade geográfica para gerar uma pontuação inteligente de compatibilidade. O foco aqui é deixar a
          decisão explícita e confiável.
        </p>
      </section>
    </div>
  );
}
