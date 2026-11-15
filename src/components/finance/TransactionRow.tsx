import { ChevronRight, Pin, PinOff, Trash2, CheckCircle2, AlertCircle, CalendarClock, Briefcase, Bus, Smartphone, Globe, GraduationCap, Car, Shield } from "lucide-react";
import { formatCurrency } from "../../lib/format";
import { cn } from "../../lib/utils";

// Mapeamento de ícones para as categorias
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
  title: string;
  subtitle?: string;
  amount: number;
  color: string;
  iconName: string;
  isFixed?: boolean;
  isRecurring?: boolean;
  status?: 'paid' | 'pending' | 'late';
  statusText?: string;
  amountColor?: string;
}

export function TransactionRow({
  title, subtitle, amount, color, iconName, isFixed, isRecurring, status, statusText, amountColor
}: TransactionRowProps) {
  const Icon = iconMap[iconName] || Briefcase;

  return (
    <div 
      className="flex flex-col sm:flex-row sm:items-center justify-between p-2 pr-4 rounded-4xl border bg-card/40 hover:bg-accent/10 transition-colors shadow-sm gap-4 sm:gap-0"
      style={{ borderColor: color }}
    >
      {/* Esquerda: Ícone e Títulos */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full ml-3" style={{ backgroundColor: color }} />
        
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-background/80 border border-border/50" 
          style={{ color: color }}
        >
          <Icon className="w-5 h-5" />
        </div>
        
        <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
        
        <div className="flex items-center gap-2 ml-1">
          <span className="font-semibold text-foreground text-sm">{title}</span>
          {isFixed && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted/50 text-muted-foreground flex items-center border border-border/50">
              <Pin className="w-3 h-3 mr-1" /> FIXO
            </span>
          )}
          {subtitle && <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">{subtitle}</span>}
        </div>
      </div>

      {/* Direita: Estado, Valor e Ações */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 w-full sm:w-auto pl-12 sm:pl-0">
        
        {/* Crachá de Estado (se existir) */}
        {status && statusText && (
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
            status === 'paid' && "bg-income/10 text-income border-income/20",
            status === 'late' && "bg-destructive/10 text-destructive border-destructive/20",
            status === 'pending' && "bg-warning/10 text-warning border-warning/20"
          )}>
            {status === 'paid' && <CheckCircle2 className="w-3.5 h-3.5" />}
            {status === 'late' && <AlertCircle className="w-3.5 h-3.5" />}
            {status === 'pending' && <CalendarClock className="w-3.5 h-3.5" />}
            {statusText}
          </div>
        )}

        {/* Valor */}
        <span 
          className="font-bold text-sm sm:w-24 text-right"
          style={{ color: amountColor || 'var(--foreground)' }}
        >
          {formatCurrency(amount)}
        </span>

        {/* Ações (Recorrente, Pin, Lixo) */}
        <div className="flex items-center gap-3 border-l border-border/50 pl-3">
          {isRecurring !== undefined && (
            <label className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              <input type="checkbox" defaultChecked={isRecurring} className="rounded border-border bg-background accent-muted-foreground" />
              Recorrente
            </label>
          )}
          
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            {isFixed ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4 opacity-50" />}
          </button>
          <button className="text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}