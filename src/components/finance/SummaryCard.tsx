import { TrendingUp, TrendingDown, PiggyBank, Wallet, Landmark, Receipt, HandCoins } from "lucide-react";
import { formatCurrency } from "../../lib/format";

interface SummaryCardsProps {
  income: number;
  expenses: number;
  saved: number;
  balance: number;
  debtsTotal: number;
  debtsPaid: number;
  receivables: number;
}

export function SummaryCards({ income, expenses, saved, balance, debtsTotal, debtsPaid, receivables }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Linha 1 */}
      <div className="bg-card p-5 rounded-2xl border border-border shadow-(--shadow-elegant)">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Receitas</h3>
          <TrendingUp className="w-4 h-4 text-income" />
        </div>
        <p className="text-2xl font-bold text-foreground">{formatCurrency(income)}</p>
      </div>

      <div className="bg-card p-5 rounded-2xl border border-border shadow-(--shadow-elegant)">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gastos</h3>
          <TrendingDown className="w-4 h-4 text-destructive" />
        </div>
        <p className="text-2xl font-bold text-foreground">{formatCurrency(expenses)}</p>
      </div>

      <div className="bg-card p-5 rounded-2xl border border-border shadow-(--shadow-elegant)">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Poupado</h3>
          <PiggyBank className="w-4 h-4 text-[#38bdf8]" />
        </div>
        <p className="text-2xl font-bold text-foreground">{formatCurrency(saved)}</p>
      </div>

      <div className="bg-card p-5 rounded-2xl border border-border shadow-(--shadow-elegant)">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Saldo do Mês</h3>
          <Wallet className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className={`text-2xl font-bold ${balance >= 0 ? 'text-foreground' : 'text-destructive'}`}>
          {formatCurrency(balance)}
        </p>
      </div>

      {/* Linha 2 */}
      <div className="bg-card p-5 rounded-2xl border border-border shadow-(--shadow-elegant)">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-warning">Dívidas</h3>
          <Landmark className="w-4 h-4 text-warning" />
        </div>
        <p className="text-2xl font-bold text-foreground">{formatCurrency(debtsTotal)}</p>
      </div>

      <div className="bg-card p-5 rounded-2xl border border-border shadow-(--shadow-elegant)">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pago em Dívidas</h3>
          <Receipt className="w-4 h-4 text-destructive" />
        </div>
        <p className="text-2xl font-bold text-foreground">{formatCurrency(debtsPaid)}</p>
      </div>

      <div className="bg-card p-5 rounded-2xl border border-border shadow-(--shadow-elegant)">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">A Receber</h3>
          <HandCoins className="w-4 h-4 text-income" />
        </div>
        <p className="text-2xl font-bold text-foreground">{formatCurrency(receivables)}</p>
      </div>
    </div>
  );
}