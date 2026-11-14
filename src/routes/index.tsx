import { useState, type SetStateAction } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog } from "../components/ui/dialog";
import { SummaryCards } from "../components/finance/SummaryCard";
import { CategoryRow } from "../components/finance/CategoryRow";
import { formatMonthYear } from "../lib/format";

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // 1. O nosso Mock Data agora é um Estado! Se ele mudar, a tela atualiza.
  const [categories, setCategories] = useState([
    {
      id: "1", name: "Moradia", color: "#1ECDA0", icon: "home",
      transactions: [{ id: "t1", description: "Aluguel", amount: 1500, date: "05/11/2026", type: "expense" as const }]
    },
    {
      id: "2", name: "Transporte", color: "#FF7A6A", icon: "car",
      transactions: [{ id: "t2", description: "Gasolina", amount: 250, date: "12/11/2026", type: "expense" as const }]
    }
  ]);

  // Estados dos Modais
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // 2. Estados para guardar o que o utilizador digita no formulário
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [txDesc, setTxDesc] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState("");

  // Totais calculados dinamicamente com base nos dados reais das categorias!
  const expenses = categories.reduce((total, cat) => 
    total + cat.transactions.reduce((acc, tx) => acc + (tx.type === 'expense' ? tx.amount : 0), 0)
  , 0);
  const income = 8500; // Fixo por enquanto
  const debts = 850;   // Fixo por enquanto

  // Funções de Navegação
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  // 3. Função para Salvar Nova Categoria
  const handleSaveCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory = {
      id: Date.now().toString(), // Gera um ID único temporário
      name: newCategoryName,
      color: "#F5A623", // Laranja (Padrão para testarmos)
      icon: "cart",
      transactions: []
    };

    setCategories([...categories, newCategory]); // Adiciona à lista
    setNewCategoryName(""); // Limpa o input
    setIsCategoryModalOpen(false); // Fecha o modal
  };

  // 4. Função para Salvar Novo Lançamento
  const handleSaveTransaction = () => {
    if (!txDesc.trim() || !txAmount || !selectedCategoryId) return;

    const newTx = {
      id: Date.now().toString(),
      description: txDesc,
      amount: parseFloat(txAmount),
      date: txDate || new Date().toLocaleDateString("pt-BR"), // Usa a data de hoje se vazio
      type: "expense" as const
    };

    // Atualiza apenas a categoria selecionada
    const updatedCategories = categories.map(cat => {
      if (cat.id === selectedCategoryId) {
        return { ...cat, transactions: [...cat.transactions, newTx] };
      }
      return cat;
    });

    setCategories(updatedCategories);
    
    // Limpa os campos
    setTxDesc("");
    setTxAmount("");
    setTxDate("");
    setSelectedCategoryId(null);
    setIsTransactionModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-(--shadow-elegant)">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Visão Geral</h2>
          <p className="text-sm text-muted-foreground">Acompanhe as suas finanças</p>
        </div>
        <div className="flex items-center gap-4 bg-background px-4 py-2 rounded-xl border border-border">
          <Button variant="ghost" onClick={prevMonth} className="h-8 w-8 hover:bg-accent/50"><ChevronLeft className="w-4 h-4" /></Button>
          <span className="font-medium text-foreground min-w-35 text-center capitalize">{formatMonthYear(currentDate)}</span>
          <Button variant="ghost" onClick={nextMonth} className="h-8 w-8 hover:bg-accent/50"><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      <SummaryCards income={income} expenses={expenses} debts={debts} />

      {/* Secção de Categorias */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Lançamentos por Categoria</h2>
          <Button 
            variant="outline" 
            className="gap-2 cursor-pointer"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            <Plus className="w-4 h-4" /> Nova Categoria
          </Button>
        </div>
        <div className="space-y-4">
          {categories.map((category) => (
            <CategoryRow 
              key={category.id} 
              category={category}
              onAddTransaction={() => {
                setSelectedCategoryId(category.id); // Memoriza onde o utilizador clicou
                setIsTransactionModalOpen(true);
              }}
            />
          ))}
          
          {categories.length === 0 && (
            <div className="text-center p-8 text-muted-foreground bg-card rounded-2xl border border-border">
              Nenhuma categoria criada.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Nova Categoria */}
      <Dialog 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
        title="Criar Categoria"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome da Categoria</label>
            <Input 
              placeholder="Ex: Lazer" 
              value={newCategoryName}
              onChange={(e: { target: { value: SetStateAction<string>; }; }) => setNewCategoryName(e.target.value)}
            />
          </div>
          <Button className="w-full mt-4 cursor-pointer" onClick={handleSaveCategory}>Guardar Categoria</Button>
        </div>
      </Dialog>

      {/* Modal: Novo Lançamento */}
      <Dialog 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)} 
        title="Adicionar Lançamento"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Input 
              placeholder="Ex: Supermercado" 
              value={txDesc}
              onChange={(e: { target: { value: SetStateAction<string>; }; }) => setTxDesc(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Valor (R$)</label>
            <Input 
              type="number" 
              placeholder="0.00" 
              step="0.01" 
              value={txAmount}
              onChange={(e: { target: { value: SetStateAction<string>; }; }) => setTxAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Data</label>
            <Input 
              type="date" 
              value={txDate}
              onChange={(e: { target: { value: SetStateAction<string>; }; }) => setTxDate(e.target.value)}
            />
          </div>
          <Button className="w-full mt-4 cursor-pointer" onClick={handleSaveTransaction}>Salvar Lançamento</Button>
        </div>
      </Dialog>

    </div>
  );
}