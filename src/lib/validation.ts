import { z } from "zod";

// ===== LOCATION SCHEMA =====

export const LocalizacaoSchema = z.object({
  cidade: z.string().min(2, "Cidade é obrigatória"),
  estado: z.string().length(2, "Estado deve ter 2 caracteres"),
  coords: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
});

// ===== USER SCHEMA =====

export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email("Email inválido"),
  displayName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  tipo: z.enum([
    "inventor",
    "investor",
    "ict",
    "industry",
    "legal",
  ] as const),
  segmentosInteresse: z.array(z.string()).min(1, "Selecione pelo menos um segmento"),
  interessesMaturidade: z.array(z.string()).min(1, "Selecione pelo menos uma maturidade"),
  localizacao: LocalizacaoSchema,
});

// ===== PROJECT SCHEMA =====

export const ProjectSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  description: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  segmento: z.string().min(2, "Segmento é obrigatório"),
  maturidade: z.enum([
    "idea",
    "prototype",
    "mvp",
    "product",
  ] as const),
  tipo: z.enum(["innovation", "improvement"] as const),
  precisa: z
    .array(
      z.enum([
        "investor",
        "ict",
        "industry",
        "legal",
      ] as const)
    )
    .min(1, "Selecione pelo menos uma necessidade"),
  localizacao: LocalizacaoSchema,
});

// ===== SUMMARY METHODS =====

export const SummaryGuidedSchema = z.object({
  problem: z.string().min(10, "Descrição do problema é obrigatória"),
  solution: z.string().min(10, "Descrição da solução é obrigatória"),
  targetAudience: z.string().min(10, "Descrição do público é obrigatória"),
  differentiator: z.string().min(10, "Diferencial é obrigatório"),
  marketPotential: z.string().min(10, "Potencial de mercado é obrigatório"),
  nextSteps: z.string().min(10, "Próximos passos é obrigatório"),
});

export const SummaryFreeTextSchema = z.object({
  freeTextSummary: z
    .string()
    .min(50, "Resumo deve ter pelo menos 50 caracteres")
    .max(1000, "Resumo não pode exceder 1000 caracteres"),
});

// ===== CREATE PROJECT FORM DATA =====

export const CreateProjectFormSchema = z
  .object({
    profileType: z.enum(["inventor", "investor", "ict", "industry", "legal", ""] as const),
    segment: z.string().min(1, "Segmento é obrigatório"),
    patentStatus: z.enum(["nao", "pendente", "concedida", ""]),
    maturity: z.enum(["idea", "prototype", "mvp", "product", ""]),
    needs: z.array(z.enum(["investor", "ict", "industry", "legal"] as const)).min(1, "Selecione pelo menos uma necessidade"),
    locationCity: z.string().min(2, "Cidade é obrigatória"),
    locationState: z.string().length(2, "Estado deve ter 2 caracteres"),
    summaryMethod: z.enum(["guiado", "textoLivre", ""]),
    problem: z.string().optional(),
    solution: z.string().optional(),
    targetAudience: z.string().optional(),
    differentiator: z.string().optional(),
    marketPotential: z.string().optional(),
    nextSteps: z.string().optional(),
    freeTextSummary: z.string().optional(),
  })
  .refine((data) => Boolean(data.profileType), "Tipo de usuário é obrigatório")
  .refine((data) => Boolean(data.maturity), "Maturidade é obrigatória")
  .refine((data) => Boolean(data.summaryMethod), "Método de resumo é obrigatório");

export type CreateProjectFormData = z.infer<typeof CreateProjectFormSchema>;
