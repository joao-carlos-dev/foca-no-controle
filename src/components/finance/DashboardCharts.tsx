import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "../../lib/format";

export interface StatusChartItem {
  name: string;
  value: number;
  color: string;
}

export interface CategoryChartItem {
  name: string;
  amount: number;
  color: string;
}

interface DashboardChartsProps {
  statusData: StatusChartItem[];
  categoryData: CategoryChartItem[];
}

export function DashboardCharts({ statusData, categoryData }: DashboardChartsProps) {
  const totalStatus = statusData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. STATUS DAS CONTAS DO MÊS (Rosca) */}
      <div className="bg-card/40 rounded-3xl border border-border/50 p-6 flex flex-col justify-between min-h-80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">
            Status das Contas do Mês
          </h3>
          {totalStatus > 0 && (
            <span className="text-xs text-muted-foreground">
              Total: <strong className="text-foreground">{formatCurrency(totalStatus)}</strong>
            </span>
          )}
        </div>

        {totalStatus === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Nenhum gasto lançado neste mês.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6 flex-1">
            <div className="w-full sm:w-1/2 h-55">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={85}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value || 0))}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "var(--foreground)",
                    }}
                    itemStyle={{ color: "var(--foreground)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legenda Lateral com Valores e % */}
            <div className="w-full sm:w-1/2 space-y-3">
              {statusData.map((item) => {
                const percent = totalStatus > 0 ? Math.round((item.value / totalStatus) * 100) : 0;
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-background/50 border border-border/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-medium text-foreground">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-foreground">
                        {formatCurrency(item.value)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{percent}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. POR CATEGORIA (Barras) */}
      <div className="bg-card/40 rounded-3xl border border-border/50 p-6 flex flex-col justify-between min-h-80">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Por categoria
        </h3>

        {categoryData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Nenhum gasto lançado neste mês.
          </div>
        ) : (
          <div className="w-full h-57.5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.4}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--accent)", opacity: 0.15 }}
                  formatter={(value) => [formatCurrency(Number (value || 0)), "Gasto"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "var(--foreground)",
                  }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} maxBarSize={48}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}