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
    <article className={`rounded-2xl border border-border bg-surface/80 p-5 shadow-card backdrop-blur-xl ${className}`}>
      {(title || subtitle || actions) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-text">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </article>
  );
}
