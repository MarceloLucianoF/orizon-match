import { z } from "zod";

// ---- Helpers ----

/** Valida dígito verificador de CPF */
function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  if (parseInt(digits[9]) !== check) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  return parseInt(digits[10]) === check;
}

/** Valida dígito verificador de CNPJ */
function isValidCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(digits[i]) * weights1[i];
  let check = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(digits[12]) !== check) return false;
  sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(digits[i]) * weights2[i];
  check = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return parseInt(digits[13]) === check;
}

// ---- Schemas ----

/** CPF ou CNPJ — aceita com ou sem formatação */
export const cpfCnpjSchema = z.string()
  .min(1, "CPF ou CNPJ é obrigatório")
  .refine(val => {
    const digits = val.replace(/\D/g, "");
    if (digits.length === 11) return isValidCPF(val);
    if (digits.length === 14) return isValidCNPJ(val);
    return false;
  }, "CPF ou CNPJ inválido");

export const emailSchema = z.string()
  .min(1, "E-mail é obrigatório")
  .email("E-mail inválido");

export const phoneSchema = z.string()
  .min(1, "Telefone é obrigatório")
  .refine(val => {
    const digits = val.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 11;
  }, "Telefone inválido. Use (00) 00000-0000");

export const nameSchema = z.string()
  .min(3, "Nome deve ter pelo menos 3 caracteres")
  .max(120, "Nome muito longo");

export const titleSchema = z.string()
  .min(5, "Título deve ter pelo menos 5 caracteres")
  .max(200, "Título muito longo");

export const passwordSchema = z.string()
  .min(6, "Senha deve ter pelo menos 6 caracteres")
  .regex(/[a-zA-Z]/, "Senha deve conter pelo menos 1 letra")
  .regex(/[0-9]/, "Senha deve conter pelo menos 1 número");

// ---- Composite Schemas ----

/** Schema do step CADASTRO no CreateProject */
export const registrationSchema = z.object({
  name: nameSchema,
  idNumber: cpfCnpjSchema,
  phone: phoneSchema,
  email: emailSchema,
});

/** Schema do step CADASTRO para novos usuários (com senha) */
export const fullRegistrationSchema = registrationSchema.extend({
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Confirme a senha"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

// ---- Masks ----

/** Aplica máscara de CPF ou CNPJ conforme digitação */
export function maskCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    // CPF: 000.000.000-00
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  // CNPJ: 00.000.000/0001-00
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

/** Aplica máscara de telefone */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    // (00) 0000-0000
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  // (00) 00000-0000
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

// ---- Utility ----

/** Valida um campo individual e retorna a mensagem de erro ou null */
export function validateField(schema: z.ZodType, value: unknown): string | null {
  const result = schema.safeParse(value);
  if (result.success) return null;
  return result.error.issues[0]?.message || "Campo inválido";
}

/** Valida um objeto contra um schema e retorna mapa de erros por campo */
export function validateForm(schema: z.ZodObject<any>, data: Record<string, any>): Record<string, string> {
  const result = schema.safeParse(data);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as string;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}
