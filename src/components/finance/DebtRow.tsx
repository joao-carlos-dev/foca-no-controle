import { useState } from "react";
import { ChevronRight, ChevronDown, Pencil, Trash2, Check, X } from "lucide-react";
import { formatCurrency } from "../../lib/format";
import { Input } from "../ui/input";
import { MoneyInput } from "../ui/money-input";
import type { DebtPayment, DebtReceivable } from "../../hooks/use-debts";

interface DebtRowProps {
  item: DebtReceivable;
  payments: DebtPayment[];
  currentMonthPaymentsCount: number;
  onEditItem: (item: DebtReceivable) => void;
  onDeleteItem: (item: DebtReceivable) => void;
  onAddPayment: (debtId: string, amount: number, description: string, date: string) => Promise<boolean>;
  onUpdatePayment: (id: string, amount: number, description: string, date: string) => Promise<boolean>;
  onDeletePayment: (id: string) => Promise<boolean>;
}

export function DebtRow({
  item,
  payments,
  currentMonthPaymentsCount,
  onEditItem,
  onDeleteItem,
  onAddPayment,
  onUpdatePayment,
  onDeletePayment,
}: DebtRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [newAmount, setNewAmount] = useState<number>(0);
  const [newNote, setNewNote] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editNote, setEditNote] = useState("");
  const [editDate, setEditDate] = useState("");

  const isDebt = item.type === "debt";
  const totalPaid = payments.reduce((acc, p) => acc + Number(p.amount), 0);
  const remaining = Math.max(0, Number(item.total_amount) - totalPaid);

  const handleSavePayment = async () => {
    if (newAmount <= 0) return;
    const ok = await onAddPayment(item.id, newAmount, newNote, newDate);
    if (ok) {
      setIsAdding(false);
      setNewAmount(0);
      setNewNote("");
    }
  };

  const startEdit = (p: DebtPayment) => {
    setEditingId(p.id);
    setEditAmount(Number(p.amount));
    setEditNote(p.description === "Pagamento" ? "" : p.description);
    setEditDate(p.date);
  };

  const handleUpdatePayment = async () => {
    if (!editingId || editAmount <= 0) return;
    const ok = await onUpdatePayment(editingId, editAmount, editNote, editDate);
    if (ok) setEditingId(null);
  };

  return (
    <div className="rounded-xl border border-border/50 bg-background/50 overflow-hidden transition-colors">
      {/* Cabeçalho da Dívida / Valor a Receber */}
      <div
        className="flex justify-between items-center p-3 px-4 hover:bg-accent/20 cursor-pointer transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="font-semibold text-sm">{item.name}</span>
        </div>

        <div className="flex items-center gap-3">
          {currentMonthPaymentsCount > 0 && (
            <span
              className={`text-xs px-2 py-1 rounded-md ${
                isDebt ? "text-destructive bg-destructive/10" : "text-income bg-income/10"
              }`}
            >
              {currentMonthPaymentsCount}{" "}
              {isDebt
                ? currentMonthPaymentsCount === 1 ? "pagamento" : "pagamentos"
                : currentMonthPaymentsCount === 1 ? "recebimento" : "recebimentos"}
            </span>
          )}

          <span className="font-bold text-sm">{formatCurrency(remaining)}</span>

          <div className="flex items-center gap-1 border-l border-border/50 pl-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEditItem(item); }}
              className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              title="Editar"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteItem(item); }}
              className="text-muted-foreground hover:text-destructive p-1 cursor-pointer"
              title="Excluir"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Área Expandida: Lançamentos */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border/30 space-y-2 bg-card/20">
          <div className="text-xs text-muted-foreground mb-2">
            Valor inicial: <strong className="text-foreground">{formatCurrency(item.total_amount)}</strong> •{" "}
            {isDebt ? "Pago" : "Recebido"} até agora: <strong className="text-foreground">{formatCurrency(totalPaid)}</strong>
          </div>

          {payments.map((p) =>
            editingId === p.id ? (
              <div key={p.id} className="flex flex-col sm:flex-row gap-2 p-2.5 rounded-xl bg-background/80 border border-border items-center">
                <div className="w-full sm:w-32">
                  <MoneyInput value={editAmount} onChange={setEditAmount} />
                </div>
                <Input
                  placeholder="Nota (opcional)"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="flex-1 bg-background"
                />
                <Input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full sm:w-auto bg-background"
                />
                <div className="flex gap-1.5">
                  <button onClick={handleUpdatePayment} className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center cursor-pointer">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div key={p.id} className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-background/60 border border-border/40 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-bold">{formatCurrency(p.amount)}</span>
                  <button onClick={() => startEdit(p)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onDeletePayment(p.id)} className="text-destructive/80 hover:text-destructive cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {p.description} • {new Date(p.date + "T12:00:00").toLocaleDateString("pt-BR")}
                </div>
              </div>
            )
          )}

          {isAdding ? (
            <div className="flex flex-col sm:flex-row gap-2 p-2.5 rounded-xl bg-background/80 border border-border items-center mt-2">
              <div className="w-full sm:w-32">
                <MoneyInput value={newAmount} onChange={setNewAmount} />
              </div>
              <Input
                placeholder="Nota (opcional)"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 bg-background"
              />
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full sm:w-auto bg-background"
              />
              <div className="flex gap-1.5">
                <button onClick={handleSavePayment} className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center cursor-pointer">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setIsAdding(false)} className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 pt-1 cursor-pointer"
            >
              + {isDebt ? "Registrar pagamento" : "Registrar recebimento"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}