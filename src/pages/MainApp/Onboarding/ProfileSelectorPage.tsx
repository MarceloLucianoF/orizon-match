import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";

type StakeholderProfile = {
  type: "inventor" | "investidor" | "ict" | "industria" | "juridico";
  title: string;
  subtitle: string;
  icon: string;
};

const PROFILES: StakeholderProfile[] = [
  { type: "inventor", title: "Tenho uma ideia", subtitle: "Quero estruturar e conectar meu projeto", icon: "💡" },
  { type: "investidor", title: "Sou investidor", subtitle: "Busco oportunidades com potencial", icon: "💸" },
  { type: "ict", title: "Sou ICT", subtitle: "Quero colaborar com pesquisa e validacao", icon: "🧪" },
  { type: "industria", title: "Sou industria", subtitle: "Busco inovacao para aplicar e escalar", icon: "🏭" },
  { type: "juridico", title: "Sou juridico", subtitle: "Apoio PI, contratos e protecao", icon: "⚖️" },
];

export default function ProfileSelectorPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="rounded-2xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur-xl">
        <h1 className="text-3xl font-semibold text-text">Escolha seu perfil</h1>
        <p className="mt-2 text-muted">
          Em menos de 5 minutos voce cria seu perfil e entra no fluxo inteligente de match.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PROFILES.map((profile) => (
          <Card
            key={profile.type}
            title={profile.title}
            subtitle={profile.subtitle}
            actions={<span className="text-2xl">{profile.icon}</span>}
            className="hover:border-primary/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.16)]"
          >
            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate(`/onboarding/new-project?profile=${profile.type}`)}
            >
              Continuar
            </Button>
          </Card>
        ))}
      </section>
    </div>
  );
}
