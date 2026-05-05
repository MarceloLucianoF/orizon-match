export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-border/80 bg-bg/80 py-8 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 text-sm text-muted">
        <p className="text-base font-semibold text-text">
          Orizon Match: conectando ideias, capital e execucao com precisao.
        </p>
        <p>
          Plataforma para inventores, ICTs, industria, investidores e juridico colaborarem com seguranca.
        </p>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          © {currentYear} Orizon Match. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
