import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  Landmark,
  HandCoins,
} from "lucide-react";
import { formatCurrency } from "../../lib/format";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  totalSaved: number;
  monthBalance: number;
  totalDebts: number;
  paidDebtsMonth: number;
  totalReceivables: number;
}

export function SummaryCards({
  totalIncome,
  totalExpenses,
  totalSaved,
  monthBalance,
  totalDebts,
  paidDebtsMonth,
  totalReceivables,
}: SummaryCardsProps) {
  const isNegativeBalance = monthBalance < 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. RECEITAS */}
      <div className="rounded-2xl p-5 border border-border/50 bg-linear-to-br from-income/15 via-card to-card flex items-center justify-between shadow-sm">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Receitas
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-income/10 flex items-center justify-center text-income">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      {/* 2. GASTOS */}
      <div className="rounded-2xl p-5 border border-border/50 bg-linear-to-br from-destructive/15 via-card to-card flex items-center justify-between shadow-sm">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Gastos
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <TrendingDown className="w-5 h-5" />
        </div>
      </div>

      {/* 3. POUPADO */}
      <div className="rounded-2xl p-5 border border-border/50 bg-linear-to-br from-[#38bdf8]/15 via-card to-card flex items-center justify-between shadow-sm">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Poupado
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(totalSaved)}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#38bdf8]/10 flex items-center justify-center text-[#38bdf8]">
          <PiggyBank className="w-5 h-5" />
        </div>
      </div>

      {/* 4. SALDO DO MÊS */}
      <div className="rounded-2xl p-5 border border-border/50 bg-card flex items-center justify-between shadow-sm">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Saldo do Mês
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(monthBalance)}
          </p>
        </div>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isNegativeBalance
              ? "bg-destructive/10 text-destructive"
              : "bg-income/10 text-income"
          }`}
        >
          <Wallet className="w-5 h-5" />
        </div>
      </div>

      {/* 5. DÍVIDAS */}
      <div className="rounded-2xl p-5 border border-border/50 bg-linear-to-br from-warning/15 via-card to-card flex items-center justify-between shadow-sm">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Dívidas
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(totalDebts)}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
          <Landmark className="w-5 h-5" />
        </div>
      </div>

      {/* 6. PAGO EM DÍVIDAS */}
      <div className="rounded-2xl p-5 border border-border/50 bg-linear-to-br from-destructive/15 via-card to-card flex items-center justify-between shadow-sm">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pago em Dívidas
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(paidDebtsMonth)}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <HandCoins className="w-5 h-5" />
        </div>
      </div>

      {/* 7. A RECEBER */}
      <div className="rounded-2xl p-5 border border-border/50 bg-linear-to-br from-income/15 via-card to-card flex items-center justify-between shadow-sm">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            A Receber
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(totalReceivables)}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-income/10 flex items-center justify-center text-income">
          <HandCoins className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}