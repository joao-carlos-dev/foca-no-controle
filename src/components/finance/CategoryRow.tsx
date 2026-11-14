import { useState } from "react";
import { ChevronDown, ChevronUp, PlusCircle, Home, ShoppingCart, Car, Coffee, HelpCircle } from "lucide-react";
import { formatCurrency } from "../../lib/format";
import { Button } from "../../components/ui/button";

// Mapeamento simples de ícones (depois o utilizador pode escolher ao criar a categoria)
const iconMap: Record<string, any> = {
  home: Home,
  cart: ShoppingCart,
  car: Car,
  coffee: Coffee,
};

// Definimos o formato base (Types) para ajudar o TypeScript
interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: "income" | "expense";
}

interface CategoryProps {
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
    transactions: Transaction[];
  };
  onAddTransaction?: () => void;
}

export function CategoryRow({ category, onAddTransaction }: CategoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Escolhe o ícone dinamicamente ou usa um ponto de interrogação se não encontrar
  const Icon = iconMap[category.icon] || HelpCircle;

  // Calcula o total gasto nesta categoria no mês
  const total = category.transactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-(--shadow-elegant) overflow-hidden transition-all duration-300">
      
      {/* Cabeçalho da Categoria (Sempre visível) */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div 
            className="p-3 rounded-xl flex items-center justify-center" 
            style={{ backgroundColor: `${category.color}20`, color: category.color }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{category.name}</h3>
            <p className="text-sm text-muted-foreground">
              {category.transactions.length} lançamento{category.transactions.length !== 1 && 's'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="font-bold text-foreground">{formatCurrency(total)}</span>
          <div className="text-muted-foreground">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Lista de Transações (Expansível) */}
      {isExpanded && (
        <div className="border-t border-border bg-background/30 p-4 animate-in slide-in-from-top-2 duration-200">
          {category.transactions.length > 0 ? (
            <div className="space-y-2">
              {category.transactions.map((t) => (
                <div key={t.id} className="flex justify-between items-center text-sm p-3 hover:bg-accent/20 rounded-lg transition-colors group border border-transparent hover:border-border">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">{t.description}</span>
                    <span className="text-muted-foreground text-xs">{t.date}</span>
                  </div>
                  <span className={`font-semibold ${t.type === 'income' ? 'text-income' : 'text-foreground'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Sem movimentos este mês.</p>
          )}
          
          <div className="mt-4 flex justify-center">
            <Button variant="ghost" className="text-primary text-sm gap-2 hover:bg-primary/10" onClick={onAddTransaction}>
              <PlusCircle className="w-4 h-4" /> Adicionar Lançamento
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}