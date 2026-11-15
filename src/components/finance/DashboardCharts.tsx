import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from "recharts";

// Dados simulados baseados na sua imagem
const distributionData = [
  { name: "Cartão de crédito", value: 1180, color: "var(--chart-1)" },
  { name: "Financiamento", value: 582, color: "var(--chart-2)" },
  { name: "Busão", value: 450, color: "var(--chart-3)" },
  { name: "Facul", value: 182, color: "var(--chart-4)" },
  { name: "Luz", value: 140, color: "var(--chart-5)" },
  { name: "Internet", value: 100, color: "var(--chart-6)" },
];

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* Gráfico 1: Distribuição (Donut) */}
      <div className="bg-card rounded-2xl border border-border shadow-(--shadow-elegant) p-6 flex flex-col">
        <h3 className="text-sm font-semibold text-foreground mb-6">Distribuição</h3>
        <div className="flex-1 min-h-62.5 relative category-pie-chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                stroke="var(--background)"
                strokeWidth={2}
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => `R$ ${Number(value).toFixed(2).replace('.', ',')}`}
                contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--popover-foreground)' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 2: Por Categoria (Barras) */}
      <div className="bg-card rounded-2xl border border-border shadow-(--shadow-elegant) p-6 flex flex-col">
        <h3 className="text-sm font-semibold text-foreground mb-6">Por categoria</h3>
        <div className="flex-1 min-h-62.5 annual-bar-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                height={50}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              />
              <Tooltip 
                cursor={{ fill: 'var(--accent)', opacity: 0.2 }}
                formatter={(value: any) => `R$ ${Number(value).toFixed(2).replace('.', ',')}`}
                contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--popover-foreground)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}