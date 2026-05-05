import Button from "../../components/ui/Button";

interface AuthPlaceholderPageProps {
  type: "login" | "register";
}

export default function AuthPlaceholderPage({ type }: AuthPlaceholderPageProps) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <section className="panel">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
          {type === "login" ? "Entrar" : "Cadastrar"}
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Pagina temporaria durante a migracao. Proximo passo: integrar com fluxo Auth real.
        </p>
        <div className="mt-5">
          <Button variant="primary">Continuar migracao Auth</Button>
        </div>
      </section>
    </div>
  );
}
