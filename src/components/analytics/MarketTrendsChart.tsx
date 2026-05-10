import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const defaultData = [
  { name: 'Tecnologia', value: 45 },
  { name: 'Energia', value: 32 },
  { name: 'Agro', value: 28 },
  { name: 'Saúde', value: 24 },
  { name: 'Indústria', value: 18 },
];

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

interface MarketTrendsChartProps {
  data?: any[];
  title?: string;
  height?: number;
}

export function MarketTrendsChart({ data = defaultData, title, height = 300 }: MarketTrendsChartProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl h-full flex flex-col">
      {title && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">{title}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Interesse por setor industrial (anônimo)</p>
        </div>
      )}
      
      <div className="flex-1 min-h-[200px]" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              width={70}
            />
            <Tooltip 
              cursor={{ fill: '#1e293b', opacity: 0.4 }}
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: '1px solid #1e293b', 
                borderRadius: '12px',
                fontSize: '12px'
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]} 
              barSize={20}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-4">
        {data.slice(0, 3).map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
            <span className="text-[10px] font-bold text-slate-400 uppercase">{item.name}: {item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
