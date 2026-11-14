import { ArrowDownCircle, ArrowUpCircle, CreditCard, Wallet } from "lucide-react";
import { formatCurrency } from "../../lib/format";

interface SummaryCardsProps {
  income: number;
  expenses: number;
  debts: number;
}

export function SummaryCards({ income, expenses, debts }: SummaryCardsProps) {
  const balance = income - expenses - debts;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-card p-6 rounded-xl border border-border shadow-(--shadow-elegant)">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Receitas</h3>
          <ArrowUpCircle className="w-5 h-5 text-income" />
        </div>
        <p className="text-2xl font-bold text-foreground">{formatCurrency(income)}</p>
      </div>

      <div className="bg-card p-6 rounded-xl border border-border shadow-(--shadow-elegant)">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Despesas</h3>
          <ArrowDownCircle className="w-5 h-5 text-destructive" />
        </div>
        <p className="text-2xl font-bold text-foreground">{formatCurrency(expenses)}</p>
      </div>

      <div className="bg-card p-6 rounded-xl border border-border shadow-(--shadow-elegant)">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Dívidas</h3>
          <CreditCard className="w-5 h-5 text-warning" />
        </div>
        <p className="text-2xl font-bold text-foreground">{formatCurrency(debts)}</p>
      </div>

      <div className="bg-card p-6 rounded-xl border border-border shadow-(--shadow-elegant) relative overflow-hidden">
        <div className="absolute inset-0 bg-(image:--gradient-glow) opacity-10 pointer-events-none" />
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="text-sm font-medium text-muted-foreground">Saldo do Mês</h3>
          <Wallet className="w-5 h-5 text-primary" />
        </div>
        <p className={`text-2xl font-bold relative z-10 ${balance >= 0 ? 'text-income' : 'text-destructive'}`}>
          {formatCurrency(balance)}
        </p>
      </div>
    </div>
  );
}