import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, subtitle, actions, children, className = "" }: CardProps) {
  return (
    <article className={`rounded-2xl border border-slate-800/60 bg-slate-900/45 p-6 shadow-card hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:border-indigo-500/20 hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-md ${className}`}>
      {(title || subtitle || actions) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>}
            {subtitle && <p className="mt-1.5 text-xs text-slate-400 font-medium leading-relaxed">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="text-slate-300 text-sm leading-relaxed">
        {children}
      </div>
    </article>
  );
}

