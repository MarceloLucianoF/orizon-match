import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Stepper from "../../../components/ui/Stepper";
import { auth } from "../../../firebase/config";
import { createProjectAndMatches } from "../../../services/matchmakingService";
import {
  calculateMatchScore,
  generateMatchExplanation,
  rankMatches,
} from "../../../lib/matching";
import { CreateProjectFormSchema, type CreateProjectFormData } from "../../../lib/validation";
import type { Localizacao, Project, User } from "../../../types";

const STEPS = ["Perfil", "Segmento", "Proteção", "Maturidade", "Necessidades", "Descrição", "Preview"];

const CANDIDATES: User[] = [
  {
    id: "candidate-1",
    uid: "candidate-1",
    email: "investidor@orizon.app",
    displayName: "Maria Investidora",
    tipo: "investidor",
    segmentosInteresse: ["tecnologia", "energia", "saude"],
    interessesMaturidade: ["mvp", "produto"],
    localizacao: { cidade: "Florianopolis", estado: "SC" },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "candidate-2",
    uid: "candidate-2",
    email: "ict@orizon.app",
    displayName: "UFSC Lab",
    tipo: "ict",
    segmentosInteresse: ["tecnologia", "saude"],
    interessesMaturidade: ["ideia", "prototipo", "mvp"],
    localizacao: { cidade: "Florianopolis", estado: "SC" },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "candidate-3",
    uid: "candidate-3",
    email: "industria@orizon.app",
    displayName: "Industria XYZ",
    tipo: "industria",
    segmentosInteresse: ["energia", "industria", "agro"],
    interessesMaturidade: ["mvp", "produto"],
    localizacao: { cidade: "Joinville", estado: "SC" },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function buildProjectPreview(values: CreateProjectFormData): Project {
  const location: Localizacao = {
    cidade: values.locationCity || "Florianopolis",
    estado: values.locationState || "SC",
  };

  return {
    id: "preview-project",
    userId: "preview-user",
    userName: "Preview",
    title: values.problem || values.segment || "Novo projeto",
    description: values.summaryMethod === "textoLivre" ? values.freeTextSummary || values.problem || "" : values.solution || values.problem || "",
    segmento: values.segment || "tecnologia",
    maturidade: values.maturity || "ideia",
    tipo: "inovacao",
    precisa: values.needs.length > 0 ? values.needs : ["investidor"],
    localizacao: location,
    status: "rascunho",
    patent:
      values.patentStatus === "concedida"
        ? { number: "PREVIEW-001", conceded: true }
        : values.patentStatus === "pendente"
          ? { number: "PREVIEW-PENDENTE", conceded: false }
          : undefined,
    protectionIntent:
      values.patentStatus === "nao"
        ? { isProtected: false, wantToProtectNow: false, proceedWithoutProtection: false }
        : { isProtected: true, wantToProtectNow: values.patentStatus === "pendente", proceedWithoutProtection: false },
    summaryMethod: values.summaryMethod || "guiado",
    summaryDetails:
      values.summaryMethod === "guiado"
        ? {
            problem: values.problem || "",
            solution: values.solution || "",
            targetAudience: values.targetAudience || "",
            differentiator: values.differentiator || "",
            marketPotential: values.marketPotential || "",
            nextSteps: values.nextSteps || "",
          }
        : undefined,
    views: 0,
    matches: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function getDefaultProfile(profile: string): CreateProjectFormData["profileType"] {
  if (profile === "investidor" || profile === "ict" || profile === "industria" || profile === "juridico") {
    return profile;
  }

  return "inventor";
}

export default function ProjectWizardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const profile = searchParams.get("profile") ?? "inventor";
  const [step, setStep] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(CreateProjectFormSchema),
    defaultValues: {
      profileType: getDefaultProfile(profile),
      segment: "tecnologia",
      patentStatus: "nao",
      maturity: "ideia",
      needs: ["investidor"],
      locationCity: "Florianopolis",
      locationState: "SC",
      summaryMethod: "guiado",
      problem: "",
      solution: "",
      targetAudience: "",
      differentiator: "",
      marketPotential: "",
      nextSteps: "",
      freeTextSummary: "",
    },
    mode: "onTouched",
  });

  const values = watch();
  const previewProject = useMemo(() => buildProjectPreview(values), [values]);
  const previewMatches = useMemo(
    () =>
      rankMatches(previewProject, CANDIDATES).slice(0, 3).map((match) => ({
        ...match,
        explanation: generateMatchExplanation(
          {
            score: match.score,
            breakdown: match.breakdown,
          },
          previewProject,
          match.user,
        ),
      })),
    [previewProject],
  );

  const stepFields: Array<Array<keyof CreateProjectFormData>> = [
    ["profileType"],
    ["segment"],
    ["patentStatus"],
    ["maturity"],
    ["needs", "locationCity", "locationState"],
    ["summaryMethod", "problem", "solution", "targetAudience", "differentiator", "marketPotential", "nextSteps", "freeTextSummary"],
    [],
  ];

  async function goNext() {
    const valid = await trigger(stepFields[step]);

    if (!valid) {
      return;
    }

    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
  }

  const onSubmit = async (data: CreateProjectFormData) => {
    const draft = buildProjectPreview(data);

    if (auth.currentUser) {
      await createProjectAndMatches({
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName ?? "Usuário Orizon",
        title: draft.title,
        description: draft.description,
        segment: draft.segmento,
        maturity: draft.maturidade,
        type: draft.tipo,
        needs: draft.precisa,
        location: draft.localizacao,
        patent: draft.patent,
        protectionIntent: draft.protectionIntent,
        summaryMethod: draft.summaryMethod,
        summaryDetails: draft.summaryDetails,
        formData: data,
      });
    } else {
      window.localStorage.setItem("orizon:last-project-draft", JSON.stringify(data));
    }

    navigate("/app/dashboard");
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Card
        title="Novo projeto inteligente"
        subtitle={`Perfil selecionado: ${profile}. Complete os passos para gerar matches.`}
      >
        <Stepper steps={STEPS} currentStep={step} />

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-6">
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted">Escolha quem representa este projeto.</p>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[
                  { value: "inventor", label: "Inventor" },
                  { value: "investidor", label: "Investidor" },
                  { value: "ict", label: "ICT" },
                  { value: "industria", label: "Indústria" },
                  { value: "juridico", label: "Jurídico" },
                ].map((item) => {
                  const active = values.profileType === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setValue("profileType", item.value as CreateProjectFormData["profileType"], { shouldValidate: true })}
                      className={`rounded-2xl border p-4 text-left transition ${active ? "border-primary bg-primary/10 text-text" : "border-border bg-surface/80 text-muted hover:border-primary/20"}`}
                    >
                      <span className="text-xs uppercase tracking-[0.24em] text-muted">Perfil</span>
                      <p className="mt-2 font-semibold">{item.label}</p>
                    </button>
                  );
                })}
              </div>
              {errors.profileType && <p className="text-sm text-rose-400">{errors.profileType.message}</p>}
            </div>
          )}

          {step === 1 && (
            <Input
              label="Segmento"
              placeholder="Ex: tecnologia, energia, saúde, agro"
              helperText="Segmento alimenta o primeiro peso do score."
              errorText={errors.segment?.message}
              {...register("segment")}
            />
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-text">Proteção da ideia</p>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { value: "nao", label: "Ainda não" },
                  { value: "pendente", label: "Em análise" },
                  { value: "concedida", label: "Concedida" },
                ].map((item) => {
                  const active = values.patentStatus === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setValue("patentStatus", item.value as CreateProjectFormData["patentStatus"], { shouldValidate: true })}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${active ? "border-primary bg-primary/10 text-text" : "border-border bg-surface/80 text-muted hover:border-primary/20"}`}
                    >
                      <p className="font-semibold">{item.label}</p>
                      <p className="mt-1 text-sm text-muted">A proteção altera o foco da recomendação.</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-text">Maturidade</p>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { value: "ideia", label: "Ideia" },
                  { value: "prototipo", label: "Protótipo" },
                  { value: "mvp", label: "MVP" },
                  { value: "produto", label: "Produto" },
                ].map((item) => {
                  const active = values.maturity === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setValue("maturity", item.value as CreateProjectFormData["maturity"], { shouldValidate: true })}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${active ? "border-primary bg-primary/10 text-text" : "border-border bg-surface/80 text-muted hover:border-primary/20"}`}
                    >
                      <p className="font-semibold">{item.label}</p>
                      <p className="mt-1 text-sm text-muted">A maturidade reduz ou amplia o score.</p>
                    </button>
                  );
                })}
              </div>
              {errors.maturity && <p className="text-sm text-rose-400">{errors.maturity.message}</p>}
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-text">Necessidades</p>
                <div className="mt-3 grid gap-3 md:grid-cols-4">
                  {[
                    { value: "investidor", label: "Investidor" },
                    { value: "ict", label: "ICT" },
                    { value: "industria", label: "Indústria" },
                    { value: "juridico", label: "Jurídico" },
                  ].map((item) => {
                    const active = values.needs.includes(item.value as never);

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          const nextNeeds = active
                            ? values.needs.filter((need) => need !== item.value)
                            : [...values.needs, item.value as never];

                          setValue("needs", nextNeeds, { shouldValidate: true });
                        }}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${active ? "border-primary bg-primary/10 text-text" : "border-border bg-surface/80 text-muted hover:border-primary/20"}`}
                      >
                        <p className="font-semibold">{item.label}</p>
                        <p className="mt-1 text-sm text-muted">Influencia a complementaridade do match.</p>
                      </button>
                    );
                  })}
                </div>
                {errors.needs && <p className="mt-2 text-sm text-rose-400">{errors.needs.message as string}</p>}
              </div>

              <Input
                label="Cidade"
                placeholder="Florianópolis"
                errorText={errors.locationCity?.message}
                {...register("locationCity")}
              />

              <Input
                label="Estado"
                placeholder="SC"
                errorText={errors.locationState?.message}
                {...register("locationState")}
              />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Problema"
                  placeholder="Qual dor você resolve?"
                  errorText={errors.problem?.message}
                  {...register("problem")}
                />
                <Input
                  label="Solução"
                  placeholder="Como o projeto resolve?"
                  errorText={errors.solution?.message}
                  {...register("solution")}
                />
                <Input
                  label="Público-alvo"
                  placeholder="Quem compra, usa ou valida?"
                  errorText={errors.targetAudience?.message}
                  {...register("targetAudience")}
                />
                <Input
                  label="Diferencial"
                  placeholder="O que torna isso defensável?"
                  errorText={errors.differentiator?.message}
                  {...register("differentiator")}
                />
                <Input
                  label="Potencial de mercado"
                  placeholder="Tese de crescimento"
                  errorText={errors.marketPotential?.message}
                  {...register("marketPotential")}
                />
                <Input
                  label="Próximos passos"
                  placeholder="Validação, piloto, investimento"
                  errorText={errors.nextSteps?.message}
                  {...register("nextSteps")}
                />
              </div>

              <div className="space-y-3 rounded-2xl border border-border bg-surface/80 p-4">
                <p className="text-sm font-medium text-text">Método do resumo</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { value: "guiado", label: "Resumo guiado" },
                    { value: "textoLivre", label: "Texto livre" },
                  ].map((item) => {
                    const active = values.summaryMethod === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setValue("summaryMethod", item.value as CreateProjectFormData["summaryMethod"], { shouldValidate: true })}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${active ? "border-primary bg-primary/10 text-text" : "border-border bg-bgSoft text-muted hover:border-primary/20"}`}
                      >
                        <p className="font-semibold">{item.label}</p>
                        <p className="mt-1 text-sm text-muted">Usado na geração do score e da narrativa.</p>
                      </button>
                    );
                  })}
                </div>

                {values.summaryMethod === "textoLivre" && (
                  <Input
                    label="Resumo livre"
                    placeholder="Descreva problema, solução, diferencial e próximos passos"
                    errorText={errors.freeTextSummary?.message}
                    {...register("freeTextSummary")}
                  />
                )}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-border bg-surface/80 p-5 shadow-card backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.22em] text-muted">Preview de match</p>
                      <h3 className="mt-2 text-2xl font-semibold text-text">Compatibilidade estimada</h3>
                    </div>
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-bold text-accent">
                      {previewMatches[0]?.score ?? 0}%
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    {previewMatches.map((match) => (
                      <div key={match.user.id} className="rounded-2xl border border-border bg-bgSoft/60 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-text">{match.user.displayName}</p>
                            <p className="text-sm capitalize text-muted">{match.user.tipo}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${match.color}`}>{match.score}%</span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface2">
                          <div className="h-full rounded-full bg-orizon-gradient" style={{ width: `${match.score}%` }} />
                        </div>

                        <ul className="mt-3 space-y-1 text-sm text-muted">
                          {match.explanation.slice(0, 3).map((reason) => (
                            <li key={reason}>• {reason}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-surface/80 p-5 shadow-card backdrop-blur-xl">
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Resumo estrutural</p>
                  <div className="mt-4 space-y-3 text-sm text-muted">
                    <p><span className="text-text">Perfil:</span> {values.profileType || profile}</p>
                    <p><span className="text-text">Segmento:</span> {values.segment}</p>
                    <p><span className="text-text">Maturidade:</span> {values.maturity}</p>
                    <p><span className="text-text">Proteção:</span> {values.patentStatus}</p>
                    <p><span className="text-text">Necessidades:</span> {values.needs.join(", ")}</p>
                    <p><span className="text-text">Localização:</span> {values.locationCity}/{values.locationState}</p>
                  </div>

                  <div className="mt-6 rounded-2xl border border-border bg-bgSoft/70 p-4">
                    <p className="text-sm font-semibold text-text">Score calculado</p>
                    <p className="mt-2 text-4xl font-bold text-primary">{calculateMatchScore(previewProject, CANDIDATES[0]).score}%</p>
                    <p className="mt-2 text-sm text-muted">
                      O algoritmo combina segmento, maturidade, necessidades e localização para explicar o match.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface/80 p-5 text-sm text-muted">
                Se você estiver autenticado, este fluxo salva o projeto no Firestore e gera matches relevantes. Sem login,
                o rascunho fica preservado localmente para continuar depois.
              </div>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between gap-3">
            <Button type="button" variant="secondary" onClick={goBack} disabled={step === 0}>
              Voltar
            </Button>

            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={goNext}>
                Avançar
              </Button>
            ) : (
              <Button type="submit" loading={isSubmitting}>
                Finalizar e ver dashboard
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
