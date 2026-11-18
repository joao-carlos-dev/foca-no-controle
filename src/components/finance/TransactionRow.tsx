import { useState } from "react";
import { 
  ChevronRight, ChevronDown, Pin, Trash2, Pencil, Calendar, CheckCircle2,
  Briefcase, Bus, Smartphone, Globe, GraduationCap, Car, Shield, Check, X 
} from "lucide-react";
import { formatCurrency } from "../../lib/format";
import { cn } from "../../lib/utils";
import { Input } from "../ui/input";
import { MoneyInput } from "../ui/money-input";

export const iconMap: Record<string, any> = {
  briefcase: Briefcase,
  bus: Bus,
  smartphone: Smartphone,
  globe: Globe,
  graduation: GraduationCap,
  car: Car,
  shield: Shield
};

interface TransactionRowProps {
  id: string;
  title: string;
  subtitle?: string;
  amount: number;
  color: string;
  iconName: string;
  type: string;
  isFixed?: boolean;
  isRecurring?: boolean;
  amountColor?: string;
  onDelete?: () => void;
  onAddTransaction?: (categoryId: string, description: string, amount: number, date: string, type: string) => Promise<boolean>;
  onUpdateTransaction?: (id: string, description: string, amount: number, date: string) => Promise<boolean>;
  onDeleteTransaction?: (id: string) => Promise<boolean>;
  onToggleStatus?: (id: string, currentStatus: string) => Promise<boolean>;
  transactions?: any[];
}

// Formata "2026-11-10" para "10/11"
function formatDayMonth(dateStr: string) {
  if (!dateStr) return "";
  const [, month, day] = dateStr.split("-");
  return `${day}/${month}`;
}

export function TransactionRow({
  id, title, amount, color, iconName, type, isFixed, amountColor, 
  onDelete, onAddTransaction, onUpdateTransaction, onDeleteTransaction, onToggleStatus, transactions = []
}: TransactionRowProps) {
  const Icon = iconMap[iconName] || Briefcase;
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newNote, setNewNote] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editNote, setEditNote] = useState("");
  const [editDate, setEditDate] = useState("");

  // Data de hoje no formato YYYY-MM-DD para comparação direta
  const todayStr = new Date().toISOString().split("T")[0];

  // Calcula o crachá de vencimento da categoria (apenas para gastos com lançamentos)
  const getCategoryBadge = () => {
    if (type !== "expense" || transactions.length === 0) return null;

    const unpaid = transactions.filter((tx) => tx.status !== "paid");
    
    // Se todos os lançamentos estão pagos
    if (unpaid.length === 0) {
      return { status: "paid" as const, text: "Pago", borderColor: "var(--income)" };
    }

    // Ordena os não pagos pela data mais antiga primeiro
    const sortedUnpaid = [...unpaid].sort((a, b) => a.date.localeCompare(b.date));
    const nextDue = sortedUnpaid[0];
    const dm = formatDayMonth(nextDue.date);

    if (nextDue.date < todayStr) {
      return { status: "late" as const, text: `Vencida ${dm}`, borderColor: "var(--destructive)" };
    }
    return { status: "pending" as const, text: `Vence ${dm}`, borderColor: "var(--warning)" };
  };

  const badge = getCategoryBadge();
  const activeBorderColor = badge ? badge.borderColor : color;

  const handleSave = async () => {
    if (newAmount <= 0) return;
    if (onAddTransaction) {
      const success = await onAddTransaction(id, newNote, newAmount, newDate, type);
      if (success) {
        setIsAdding(false);
        setNewAmount(0);
        setNewNote("");
      }
    }
  };

  const startEdit = (tx: any) => {
    setEditingTxId(tx.id);
    setEditAmount(Number(tx.amount));
    setEditNote(tx.description === "Lançamento" ? "" : tx.description);
    setEditDate(tx.date);
  };

  const handleUpdate = async () => {
    if (!editingTxId || editAmount <= 0) return;
    if (onUpdateTransaction) {
      const success = await onUpdateTransaction(editingTxId, editNote, editAmount, editDate);
      if (success) {
        setEditingTxId(null);
      }
    }
  };

  return (
    <div className={cn(
      "flex flex-col rounded-4xl border transition-colors shadow-sm",
      isExpanded ? "bg-card/40" : "bg-card/20 hover:bg-accent/5"
    )} style={{ borderColor: activeBorderColor }}>
      
      {/* LINHA PRINCIPAL DA CATEGORIA */}
      <div 
        className="flex flex-col sm:flex-row sm:items-center justify-between p-2 pr-4 cursor-pointer gap-4 sm:gap-0"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full ml-3" style={{ backgroundColor: activeBorderColor }} />
          
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-background/80 border border-border/50" style={{ color: activeBorderColor }}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-muted-foreground sm:flex">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
          
          <div className="flex items-center gap-2 ml-1">
            <span className="font-semibold text-foreground text-sm">{title}</span>
            {isFixed && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted/50 text-muted-foreground flex items-center border border-border/50">
                <Pin className="w-3 h-3 mr-1" /> FIXO
              </span>
            )}
          </div>
        </div>

        {/* LADO DIREITO: Crachá de Vencimento + Valor + Ações */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto pl-12 sm:pl-0">
          
          {badge && (
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
              badge.status === "paid" && "bg-income/10 text-income border-income/30",
              badge.status === "late" && "bg-destructive/10 text-destructive border-destructive/30",
              badge.status === "pending" && "bg-warning/10 text-warning border-warning/30"
            )}>
              {badge.status === "paid" ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Calendar className="w-3.5 h-3.5" />
              )}
              {badge.text}
            </div>
          )}

          <span className="font-bold text-sm sm:min-w-24 text-right" style={{ color: amountColor || 'var(--foreground)' }}>
            {formatCurrency(amount)}
          </span>

          <div className="flex items-center gap-3 border-l border-border/50 pl-3">
            <button 
              className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer" 
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ÁREA EXPANDIDA (Lançamentos e Formulário) */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border/30 mx-4">
          
          <div className="space-y-2 mb-3">
            {transactions.map(tx => {
              const isPaid = tx.status === "paid";
              const isLate = !isPaid && tx.date < todayStr;
              const dm = formatDayMonth(tx.date);

              return editingTxId === tx.id ? (
                /* MODO DE EDIÇÃO INLINE */
                <div key={tx.id} className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl bg-background/80 border border-border items-center animate-in fade-in zoom-in-95">
                  <div className="w-full sm:w-32">
                    <MoneyInput value={editAmount} onChange={setEditAmount} />
                  </div>
                  <Input 
                    placeholder="Nota (opcional)" 
                    value={editNote} 
                    onChange={e => setEditNote(e.target.value)} 
                    className="flex-1 bg-background"
                  />
                  <Input 
                    type="date" 
                    value={editDate} 
                    onChange={e => setEditDate(e.target.value)} 
                    className="w-full sm:w-auto bg-background"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleUpdate} className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 cursor-pointer">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingTxId(null)} className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* VISUALIZAÇÃO PADRÃO DO LANÇAMENTO */
                <div key={tx.id} className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50 gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => onToggleStatus?.(tx.id, tx.status)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer",
                        isPaid 
                          ? "bg-income/20 text-income border-income/30" 
                          : "bg-accent/20 text-foreground border-border/50 hover:bg-accent/40"
                      )}
                      title={isPaid ? "Clique para marcar como pendente" : "Clique para marcar como pago"}
                    >
                      {isPaid ? "Pago ✓" : "Paguei"}
                    </button>

                    <span className="font-bold text-sm">{formatCurrency(tx.amount)}</span>
                    
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => startEdit(tx)} 
                        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1"
                        title="Editar lançamento"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => onDeleteTransaction?.(tx.id)} 
                        className="text-destructive/80 hover:text-destructive transition-colors cursor-pointer p-1"
                        title="Excluir lançamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Data de vencimento na linha do lançamento */}
                    <span className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      isPaid ? "text-income" : isLate ? "text-destructive" : "text-warning"
                    )}>
                      <Calendar className="w-3.5 h-3.5" />
                      {isPaid ? `Pago (${dm})` : isLate ? `Vence ${dm} • atrasada` : `Vence ${dm}`}
                    </span>

                    {tx.description && tx.description !== "Lançamento" && (
                      <span className="text-xs text-muted-foreground">• {tx.description}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Formulário de Adicionar Novo */}
          {isAdding ? (
            <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl bg-background/80 border border-border items-center mt-2 animate-in fade-in zoom-in-95">
              <div className="w-full sm:w-32">
                <MoneyInput value={newAmount} onChange={setNewAmount} />
              </div>
              <Input 
                placeholder="Nota (opcional)" 
                value={newNote} 
                onChange={e => setNewNote(e.target.value)} 
                className="flex-1 bg-background"
              />
              <Input 
                type="date" 
                value={newDate} 
                onChange={e => setNewDate(e.target.value)} 
                className="w-full sm:w-auto bg-background"
              />
              <div className="flex gap-2">
                <button onClick={handleSave} className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 cursor-pointer">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setIsAdding(false)} className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAdding(true)}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mt-2 px-2 py-1 rounded-md transition-colors cursor-pointer"
            >
              + Adicionar lançamento
            </button>
          )}
        </div>
      )}
    </div>
  );
}