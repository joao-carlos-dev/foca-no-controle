import { useState, type SetStateAction } from "react";
import { ChevronLeft, ChevronRight, User, LogOut, BarChart2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
/*import { SummaryCards } from "../components/finance/SummaryCard";*/
import { formatCurrency, formatMonthYear } from "../lib/format";
import { DashboardCharts } from "../components/finance/DashboardCharts";
import { TransactionRow } from "../components/finance/TransactionRow";
import { useFinance } from "../hooks/use-finance";
import { Dialog } from "../components/ui/dialog";
import { Input } from "../components/ui/input";

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Usar o nosso novo hook!
  const { categories, addCategory } = useFinance();

  // Estados dos Modais
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("var(--chart-1)");

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const handleSaveCategory = async () => {
    if (!newCatName.trim()) return;

    // Chama o Supabase (passamos 'briefcase' como ícone padrão por agora)
    const result = await addCategory(newCatName, newCatColor, "briefcase");

    if (result) {
      setNewCatName("");
      setNewCatColor("var(--chart-1)");
      setIsCategoryModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col animate-in fade-in duration-500 pb-20">

      {/* 1. TOP BAR (Cabeçalho) */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          {/* Pode substituir esta div pela tag <img /> com a logo da Foca depois */}
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
            F
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground leading-tight">Foca no Controle</h1>
            <p className="text-xs text-muted-foreground">Acompanhe gastos e poupança mês a mês</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            <User className="w-5 h-5" />
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-5 h-5" />
          </Button>
          <Link to="/visao-anual">
            <Button variant="outline" className="gap-2 border-border/50 bg-card">
              <BarChart2 className="w-4 h-4" /> Visão anual
            </Button>
          </Link>

          {/* Seletor de Mês */}
          <div className="flex items-center gap-2 bg-card px-2 py-1.5 rounded-xl border border-border/50 ml-2">
            <Button variant="ghost" onClick={prevMonth} className="h-7 w-7 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex flex-col items-center justify-center min-w-25">
              <span className="text-xs font-medium text-foreground capitalize leading-tight">
                {formatMonthYear(currentDate).split(" de ")[0]}
              </span>
              <span className="text-[10px] text-muted-foreground leading-none">
                {currentDate.getFullYear()}
              </span>
            </div>
            <Button variant="ghost" onClick={nextMonth} className="h-7 w-7 text-muted-foreground hover:text-foreground">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">


        {/* Gráficos Recharts */}
        <DashboardCharts />

        {/* Esqueleto das novas secções que vamos construir a seguir */}
        <div className="space-y-8">

          {/* RECEITAS */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-income mb-4">Receitas</h2>
            <div className="space-y-3">
              <TransactionRow
                title="Salário"
                subtitle="Receita"
                amount={2309.84}
                color="var(--income)"
                amountColor="var(--income)"
                iconName="briefcase"
                isFixed={false}
              />
            </div>
          </section>

          {/* GASTOS */}
          <section>
            <div className="flex items-center justify-between mb-4 p-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Gastos</h2>
              <Button 
                variant="outline" 
                className="gap-2 h-8 border-border/50 text-xs rounded-full cursor-pointer hover:bg-accent/50"
                onClick={() => setIsCategoryModalOpen(true)}
              >
                + Nova categoria
              </Button>
            </div>
            
            {/* Modal: Nova Categoria - Mantenha o modal que já tem aqui! */}
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
                    value={newCatName}
                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setNewCatName(e.target.value)}
                  />
                </div>

                <Button className="w-full mt-4 cursor-pointer" onClick={handleSaveCategory}>
                  Guardar Categoria
                </Button>
              </div>
            </Dialog>

            {/* AQUI ESTÁ A MÁGICA: Listar as categorias vindas do Supabase */}
            <div className="space-y-3">
              {categories.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground bg-card/30 rounded-2xl border border-border/50">
                  Nenhuma categoria criada. Clique em "+ Nova categoria" para começar.
                </div>
              ) : (
                categories.map((cat) => (
                  <TransactionRow
                    key={cat.id}
                    title={cat.name}
                    amount={0} 
                    color={cat.color}
                    iconName={cat.icon}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      {/* INVESTIMENTOS */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#38bdf8] mb-4">Investimentos</h2>
        <div className="space-y-3">
          <TransactionRow
            title="Investimento"
            subtitle="POUPAR"
            amount={0}
            color="#38bdf8"
            amountColor="#38bdf8"
            iconName="briefcase"
            isFixed={false}
          />
        </div>
      </section>

      {/* DÍVIDAS */}
      <section>
        <div className="flex items-center justify-between mb-4 p-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-warning">Dívidas</h2>
          <Button variant="outline" className="gap-2 h-8 border-border/50 text-xs rounded-full cursor-pointer hover:bg-accent/50">
            + Nova dívida
          </Button>
        </div>

        {/* O Card Agrupador */}
        <div className="bg-card/30 rounded-4xl border border-border/50 p-4">

          {/* Cabeçalho dos Totais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-warning/10 rounded-xl p-4 flex justify-between items-center border border-warning/20">
              <div className="flex items-center gap-2 text-warning font-semibold text-xs uppercase tracking-wider">
                TOTAL DAS DÍVIDAS
              </div>
              <span className="font-bold text-foreground">{formatCurrency(7249.51)}</span>
            </div>

            <div className="bg-destructive/10 rounded-xl p-4 flex justify-between items-center border border-destructive/20">
              <div className="flex items-center gap-2 text-destructive font-semibold text-xs uppercase tracking-wider">
                PAGO EM NOVEMBRO
              </div>
              <span className="font-bold text-foreground">{formatCurrency(444.90)}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground px-2 mb-4">
            O saldo das dívidas não desconta o saldo do mês. Só os pagamentos que registar aqui são descontados — e apenas no mês em que foram feitos.
          </p>

          {/* Lista Interna (Exemplos simplificados) */}
          <div className="space-y-2">
            {[
              { name: "Mãe", amount: 4901.00 },
              { name: "Eduardo", amount: 139.00 },
              { name: "Diegos", amount: 76.00 },
            ].map((debt, i) => (
              <div key={i} className="flex justify-between items-center p-3 px-4 rounded-xl hover:bg-accent/20 cursor-pointer transition-colors border border-border/50 bg-background/50">
                <div className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">{debt.name}</span>
                </div>
                <span className="font-bold text-sm">{formatCurrency(debt.amount)}</span>
              </div>
            ))}

            {/* Exemplo com pagamento */}
            <div className="flex justify-between items-center p-3 px-4 rounded-xl hover:bg-accent/20 cursor-pointer transition-colors border border-border/50 bg-background/50">
              <div className="flex items-center gap-3">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-sm">Empréstimo (Itau)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded-md">1 pagamento</span>
                <span className="font-bold text-sm">{formatCurrency(1144.43)}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* DINHEIRO A RECEBER */}
      <section>
        <div className="flex items-center justify-between mb-4 p-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-income">Dinheiro a Receber</h2>
          <Button variant="outline" className="gap-2 h-8 border-border/50 text-xs rounded-full cursor-pointer hover:bg-accent/50">
            + Novo valor a receber
          </Button>
        </div>

        <div className="bg-card/30 rounded-4xl border border-border/50 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-income/10 rounded-xl p-4 flex justify-between items-center border border-income/20">
              <div className="flex items-center gap-2 text-income font-semibold text-xs uppercase tracking-wider">
                TOTAL A RECEBER
              </div>
              <span className="font-bold text-foreground">{formatCurrency(0)}</span>
            </div>

            <div className="bg-income/5 rounded-xl p-4 flex justify-between items-center border border-income/10 opacity-70">
              <div className="flex items-center gap-2 text-income font-semibold text-xs uppercase tracking-wider">
                RECEBIDO EM NOVEMBRO
              </div>
              <span className="font-bold text-foreground">{formatCurrency(0)}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground px-2 mb-8">
            Esta secção é apenas um controle do dinheiro emprestado. Nenhum valor aqui entra na receita ou nos gastos do mês, nem no saldo.
          </p>

          <div className="text-center py-6 text-sm text-muted-foreground">
            Nenhum valor a receber cadastrado.
          </div>
        </div>
      </section>
    </div>
  );
}