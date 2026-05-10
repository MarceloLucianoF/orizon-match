import { Link } from "react-router-dom";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaLink?: string;
  onCtaClick?: () => void;
}

export function EmptyState({ icon: Icon, title, description, ctaLabel, ctaLink, onCtaClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-5">
        <Icon className="text-slate-500" size={32} />
      </div>
      <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">{description}</p>
      {ctaLabel && ctaLink && (
        <Link
          to={ctaLink}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)] flex items-center gap-2"
        >
          {ctaLabel}
        </Link>
      )}
      {ctaLabel && onCtaClick && !ctaLink && (
        <button
          onClick={onCtaClick}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)]"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
