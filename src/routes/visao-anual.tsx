import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  HandCoins,
  Wallet,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useFinance } from "../hooks/use-finance";
import { useDebts } from "../hooks/use-debts";
import { formatCurrency } from "../lib/format";
import { Button } from "../components/ui/button";

const MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const STACK_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const TOOLTIP_STYLE = {
  backgroundColor: "var(--card)",
  borderColor: "var(--border)",
  borderRadius: "12px",
  fontSize: "12px",
  color: "var(--foreground)",
};

export default function VisaoAnual() {
  const { categories, transactions, loadingCategories } = useFinance();
  const { items: debtItems, payments: debtPayments, loading: loadingDebts } = useDebts();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Anos disponíveis no seletor (sempre inclui o ano atual + anos com registros)
  const availableYears = useMemo(() => {
    const years = new Set<number>([currentYear]);
    transactions.forEach((tx) => {
      const y = Number(tx.date.slice(0, 4));
      if (!isNaN(y)) years.add(y);
    });
    debtPayments.forEach((p) => {
      const y = Number(p.date.slice(0, 4));
      if (!isNaN(y)) years.add(y);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions, debtPayments, currentYear]);

  // Cálculos consolidados do ano selecionado
  const {
    monthlyData,
    annualTotals,
    topCategories,
    topCategoriesChartData,
  } = useMemo(() => {
    const yearStr = String(selectedYear);
    const debtsOnly = debtItems.filter((i) => i.type === "debt");
    const debtIds = new Set(debtsOnly.map((d) => d.id));

    const yearTransactions = transactions.filter((tx) => tx.date.startsWith(yearStr));
    const yearExpenses = yearTransactions.filter((tx) => tx.type === "expense");

    // 1. Top 5 categorias de gasto no ano
    const catTotals = new Map<string, number>();
    yearExpenses.forEach((tx) => {
      catTotals.set(tx.category_id, (catTotals.get(tx.category_id) || 0) + Number(tx.amount));
    });

    const topCats = Array.from(catTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([catId], idx) => {
        const found = categories.find((c) => c.id === catId);
        return {
          id: catId,
          name: found ? found.name : "Outros",
          color: STACK_COLORS[idx % STACK_COLORS.length],
        };
      });

    // 2. Dados mês a mês (Jan a Dez)
    const months = MONTHS.map((label, index) => {
      const monthNum = String(index + 1).padStart(2, "0");
      const prefix = `${yearStr}-${monthNum}`;
      const endOfMonth = `${prefix}-31`;

      const mTxs = yearTransactions.filter((tx) => tx.date.startsWith(prefix));
      const receitas = mTxs
        .filter((tx) => tx.type === "income")
        .reduce((acc, tx) => acc + Number(tx.amount), 0);
      const gastos = mTxs
        .filter((tx) => tx.type === "expense")
        .reduce((acc, tx) => acc + Number(tx.amount), 0);
      const poupado = mTxs
        .filter((tx) => tx.type === "investment")
        .reduce((acc, tx) => acc + Number(tx.amount), 0);

      const pagoDividas = debtPayments
        .filter((p) => debtIds.has(p.debt_id) && p.date.startsWith(prefix))
        .reduce((acc, p) => acc + Number(p.amount), 0);

      // Saldo de dívidas acumulado até o fim daquele mês
      const dividas = debtsOnly.reduce((acc, d: any) => {
        const createdDate = d.created_at ? String(d.created_at).slice(0, 10) : "1900-01-01";
        if (createdDate > endOfMonth) return acc;

        const paidUntilMonth = debtPayments
          .filter((p) => p.debt_id === d.id && p.date <= endOfMonth)
          .reduce((sum, p) => sum + Number(p.amount), 0);

        return acc + Math.max(0, Number(d.total_amount) - paidUntilMonth);
      }, 0);

      const saldo = receitas - gastos - poupado - pagoDividas;

      return {
        month: label,
        receitas,
        gastos,
        poupado,
        dividas,
        pagoDividas,
        saldo,
      };
    });

    // 3. Dados empilhados por mês para Top 5 categorias
    const stackedData = MONTHS.map((label, index) => {
      const prefix = `${yearStr}-${String(index + 1).padStart(2, "0")}`;
      const row: Record<string, any> = { month: label };

      topCats.forEach((cat) => {
        row[cat.name] = yearExpenses
          .filter((tx) => tx.category_id === cat.id && tx.date.startsWith(prefix))
          .reduce((acc, tx) => acc + Number(tx.amount), 0);
      });

      return row;
    });

    // 4. Totais do Ano
    const totalReceitas = months.reduce((acc, m) => acc + m.receitas, 0);
    const totalGastos = months.reduce((acc, m) => acc + m.gastos, 0);
    const totalPoupado = months.reduce((acc, m) => acc + m.poupado, 0);
    const totalPagoDividas = months.reduce((acc, m) => acc + m.pagoDividas, 0);
    const saldoAno = totalReceitas - totalGastos - totalPoupado - totalPagoDividas;

    return {
      monthlyData: months,
      annualTotals: {
        totalReceitas,
        totalGastos,
        totalPoupado,
        totalPagoDividas,
        saldoAno,
      },
      topCategories: topCats,
      topCategoriesChartData: stackedData,
    };
  }, [transactions, categories, debtItems, debtPayments, selectedYear]);

  // Exportar tabela mensal em CSV
  const handleExportCSV = () => {
    const header = ["Mês", "Receitas", "Gastos", "Poupado", "Dívidas", "Pago em Dívidas", "Saldo"];
    const rows = monthlyData.map((m) => [
      `${m.month}/${selectedYear}`,
      m.receitas.toFixed(2),
      m.gastos.toFixed(2),
      m.poupado.toFixed(2),
      m.dividas.toFixed(2),
      m.pagoDividas.toFixed(2),
      m.saldo.toFixed(2),
    ]);

    const csvContent =
      "\uFEFF" +
      [header, ...rows].map((row) => row.join(";")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `visao-anual-${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loadingCategories || loadingDebts) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Carregando visão anual...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col animate-in fade-in duration-300 pb-20">
      {/* CABEÇALHO */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-border/50">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
            title="Voltar para a Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground leading-tight">
              Visão anual
            </h1>
            <p className="text-xs text-muted-foreground">
              Acompanhe a evolução dos seus gastos no ano
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="gap-2 border-border/50 bg-card rounded-full text-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="h-9 px-4 rounded-full border border-border/50 bg-card text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* 5 CARTÕES DE RESUMO DO ANO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-2xl p-5 border border-border/50 bg-linear-to-br from-income/15 via-card to-card flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Receitas no ano
              </p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(annualTotals.totalReceitas)}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-income/10 flex items-center justify-center text-income shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="rounded-2xl p-5 border border-border/50 bg-linear-to-br from-destructive/15 via-card to-card flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Gastos no ano
              </p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(annualTotals.totalGastos)}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>

          <div className="rounded-2xl p-5 border border-border/50 bg-linear-to-br from-savings/15 via-card to-card flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Poupado no ano
              </p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(annualTotals.totalPoupado)}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-savings/10 flex items-center justify-center text-savings shrink-0">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>

          <div className="rounded-2xl p-5 border border-border/50 bg-linear-to-br from-destructive/15 via-card to-card flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pago em dívidas
              </p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(annualTotals.totalPagoDividas)}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
              <HandCoins className="w-4 h-4" />
            </div>
          </div>

          <div className="rounded-2xl p-5 border border-border/50 bg-card flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Saldo do ano
              </p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(annualTotals.saldoAno)}
              </p>
            </div>
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                annualTotals.saldoAno < 0
                  ? "bg-destructive/10 text-destructive"
                  : "bg-income/10 text-income"
              }`}
            >
              <Wallet className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* GRÁFICO 1: Receitas vs Gastos vs Poupado por mês */}
        <section className="bg-card/40 rounded-3xl border border-border/50 p-6 annual-bar-chart">
          <h2 className="text-sm font-semibold text-foreground mb-6">
            Receitas vs Gastos vs Poupado por mês
          </h2>
          <div className="w-full h-75">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "var(--accent)", opacity: 0.15 }}
                  formatter={(value) => formatCurrency(Number(value || 0))}
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ color: "var(--foreground)", fontWeight: 600, marginBottom: "4px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                <Bar dataKey="receitas" name="Receitas" fill="var(--income)" radius={[6, 6, 0, 0]} maxBarSize={24} />
                <Bar dataKey="gastos" name="Gastos" fill="var(--destructive)" radius={[6, 6, 0, 0]} maxBarSize={24} />
                <Bar dataKey="poupado" name="Poupado" fill="var(--savings)" radius={[6, 6, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* GRÁFICO 2: Evolução do saldo mensal */}
        <section className="bg-card/40 rounded-3xl border border-border/50 p-6">
          <h2 className="text-sm font-semibold text-foreground mb-6">
            Evolução do saldo mensal
          </h2>
          <div className="w-full h-65">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value || 0)), "Saldo"]}
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ color: "var(--foreground)", fontWeight: 600, marginBottom: "4px" }}
                  itemStyle={{ color: "var(--primary)" }}
                />
                <Line
                  type="monotone"
                  dataKey="saldo"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "var(--primary)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* GRÁFICO 3: Evolução das dívidas */}
        <section className="bg-card/40 rounded-3xl border border-border/50 p-6">
          <h2 className="text-sm font-semibold text-foreground mb-6">
            Evolução das dívidas
          </h2>
          <div className="w-full h-65">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value || 0))}
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ color: "var(--foreground)", fontWeight: 600, marginBottom: "4px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                <Line
                  type="monotone"
                  dataKey="dividas"
                  name="Dívidas"
                  stroke="var(--warning)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "var(--warning)" }}
                />
                <Line
                  type="monotone"
                  dataKey="pagoDividas"
                  name="Pago em dívidas"
                  stroke="var(--destructive)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "var(--destructive)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* GRÁFICO 4: Top categorias de gasto — mês a mês */}
        <section className="bg-card/40 rounded-3xl border border-border/50 p-6">
          <h2 className="text-sm font-semibold text-foreground mb-6">
            Top categorias de gasto — mês a mês
          </h2>
          {topCategories.length === 0 ? (
            <div className="h-55 flex items-center justify-center text-sm text-muted-foreground">
              Nenhum gasto registrado em {selectedYear}.
            </div>
          ) : (
            <div className="w-full h-75">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCategoriesChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "var(--accent)", opacity: 0.15 }}
                    formatter={(value) => formatCurrency(Number(value || 0))}
                    contentStyle={TOOLTIP_STYLE}
                    labelStyle={{ color: "var(--foreground)", fontWeight: 600, marginBottom: "4px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                  {topCategories.map((cat) => (
                    <Bar
                      key={cat.id}
                      dataKey={cat.name}
                      stackId="a"
                      fill={cat.color}
                      maxBarSize={44}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* TABELA: Resumo mês a mês */}
        <section className="bg-card/40 rounded-3xl border border-border/50 overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-sm font-semibold text-foreground">
              Resumo mês a mês
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/50 bg-background/30">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Mês</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Receitas</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Gastos</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Poupado</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Dívidas</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Pago em dívidas</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {monthlyData.map((row) => (
                  <tr key={row.month} className="hover:bg-accent/15 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-foreground">{row.month}</td>
                    <td className="px-6 py-3.5 text-right font-medium text-income">
                      {formatCurrency(row.receitas)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-medium text-destructive">
                      {formatCurrency(row.gastos)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-medium text-savings">
                      {formatCurrency(row.poupado)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-medium text-warning">
                      {formatCurrency(row.dividas)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-medium text-destructive">
                      {formatCurrency(row.pagoDividas)}
                    </td>
                    <td
                      className={`px-6 py-3.5 text-right font-bold ${
                        row.saldo < 0 ? "text-destructive" : "text-income"
                      }`}
                    >
                      {formatCurrency(row.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}