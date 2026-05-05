interface SimpleContentPageProps {
  title: string;
  subtitle: string;
}

export default function SimpleContentPage({ title, subtitle }: SimpleContentPageProps) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <section className="panel">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">{subtitle}</p>
      </section>
    </div>
  );
}
