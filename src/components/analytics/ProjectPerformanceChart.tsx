import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

const defaultData = [
  { name: 'Jan', views: 40, saves: 10 },
  { name: 'Fev', views: 30, saves: 5 },
  { name: 'Mar', views: 65, saves: 15 },
  { name: 'Abr', views: 80, saves: 20 },
  { name: 'Mai', views: 95, saves: 25 },
  { name: 'Jun', views: 120, saves: 30 },
];

interface ProjectPerformanceChartProps {
  data?: any[];
  title?: string;
  height?: number;
}

export function ProjectPerformanceChart({ data = defaultData, title, height = 300 }: ProjectPerformanceChartProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl h-full flex flex-col">
      {title && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">{title}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Comparativo de alcance e interesse mensal</p>
        </div>
      )}
      
      <div className="flex-1 min-h-[200px]" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSaves" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: '1px solid #1e293b', 
                borderRadius: '12px',
                fontSize: '12px',
                color: '#f1f5f9'
              }}
              itemStyle={{ fontSize: '10px' }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
            />
            <Area 
              type="monotone" 
              dataKey="views" 
              name="Visualizações"
              stroke="#6366f1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorViews)" 
            />
            <Area 
              type="monotone" 
              dataKey="saves" 
              name="Salvos"
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSaves)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
