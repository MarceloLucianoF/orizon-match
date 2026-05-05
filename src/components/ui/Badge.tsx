type BadgeTone = "default" | "success" | "warning" | "danger" | "brand";

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
  danger: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200",
  brand: "bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200",
};

export default function Badge({ label, tone = "default" }: BadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {label}
    </span>
  );
}
