import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  trend?: number; // percentual de mudança
  icon: any;
  description?: string;
  color?: "indigo" | "emerald" | "amber" | "rose" | "cyan";
}

export function StatsCard({ label, value, trend, icon: Icon, description, color = "indigo" }: StatsCardProps) {
  const colorClasses = {
    indigo: "from-indigo-500/20 text-indigo-400 border-indigo-500/20",
    emerald: "from-emerald-500/20 text-emerald-400 border-emerald-500/20",
    amber: "from-amber-500/20 text-amber-400 border-amber-500/20",
    rose: "from-rose-500/20 text-rose-400 border-rose-500/20",
    cyan: "from-cyan-500/20 text-cyan-400 border-cyan-500/20",
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl hover:border-slate-700 transition-all group overflow-hidden relative shadow-[0_18px_45px_rgba(2,6,23,0.18)]">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color].split(' ')[0]} blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity`} />
      
      <div className="flex justify-between items-start gap-4 relative z-10">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.24em] leading-tight">{label}</p>
          <h3 className="text-2xl sm:text-[2rem] font-black text-white leading-none">{value}</h3>
          {description && <p className="text-[10px] text-slate-500">{description}</p>}
        </div>
        <div className={`w-11 h-11 shrink-0 rounded-2xl bg-slate-950 border flex items-center justify-center ${colorClasses[color].split(' ').slice(1).join(' ')}`}>
          <Icon size={24} />
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-2 relative z-10 flex-wrap">
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            trend > 0 ? "bg-emerald-500/10 text-emerald-400" : 
            trend < 0 ? "bg-rose-500/10 text-rose-400" : 
            "bg-slate-800 text-slate-500"
          }`}>
            {trend > 0 ? <TrendingUp size={10} /> : trend < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
            {Math.abs(trend)}%
          </div>
          <span className="text-[10px] text-slate-600 font-medium italic">em relação ao mês anterior</span>
        </div>
      )}
    </div>
  );
}
