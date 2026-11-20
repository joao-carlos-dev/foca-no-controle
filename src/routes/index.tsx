import { useState, useMemo } from "react";
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
import { useDebts, type DebtReceivable } from "../hooks/use-debts";
import { DebtRow } from "../components/finance/DebtRow";
import { MoneyInput } from "../components/ui/money-input";
import { SummaryCards } from "../components/finance/SummaryCard";


export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Estados dos Modais
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState("expense"); // 'expense', 'investment', 'income'
  const [newCatParent, setNewCatParent] = useState(""); // Guarda o ID da categoria pai

  const { categories, addCategory, deleteCategory, transactions, addTransaction, updateTransaction, deleteTransaction, toggleTransactionStatus } = useFinance();

  // Estados do Modal de Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string, name: string } | null>(null);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const handleSaveCategory = async () => {
    if (!newCatName.trim()) return;

    const parentId = newCatParent === "" ? null : newCatParent;

    const result = await addCategory(
      newCatName,
      "var(--chart-1)",
      "briefcase",
      newCatType,
      parentId
    );

    if (result) {
      setNewCatName("");
      setNewCatType("expense");
      setNewCatParent("");
      setIsCategoryModalOpen(false);
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    setCategoryToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    const success = await deleteCategory(categoryToDelete.id);
    if (success) {
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleAddTransaction = async (categoryId: string, note: string, amount: number, date: string, type: string) => {
    const result = await addTransaction(categoryId, note, amount, date, type);
    return !!result;
  };

  const handleUpdateTransaction = async (id: string, note: string, amount: number, date: string) => {
    const result = await updateTransaction(id, note, amount, date);
    return !!result;
  };

  const handleDeleteTransaction = async (id: string) => {
    return await deleteTransaction(id);
  };

  const {
    items: debtItems,
    payments: debtPayments,
    addItem: addDebtItem,
    updateItem: updateDebtItem,
    deleteItem: deleteDebtItem,
    addPayment: addDebtPayment,
    updatePayment: updateDebtPayment,
    deletePayment: deleteDebtPayment,
  } = useDebts();

  // Modal de Criar / Editar Dívida ou Valor a Receber
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [debtModalType, setDebtModalType] = useState<"debt" | "receivable">("debt");
  const [editingDebt, setEditingDebt] = useState<DebtReceivable | null>(null);
  const [debtName, setDebtName] = useState("");
  const [debtAmount, setDebtAmount] = useState<number>(0);

  // Modal de Excluir Dívida / Valor a Receber
  const [debtToDelete, setDebtToDelete] = useState<DebtReceivable | null>(null);

  const openNewDebtModal = (type: "debt" | "receivable") => {
    setEditingDebt(null);
    setDebtModalType(type);
    setDebtName("");
    setDebtAmount(0);
    setIsDebtModalOpen(true);
  };

  const openEditDebtModal = (item: DebtReceivable) => {
    setEditingDebt(item);
    setDebtModalType(item.type);
    setDebtName(item.name);
    setDebtAmount(Number(item.total_amount));
    setIsDebtModalOpen(true);
  };

  const handleSaveDebt = async () => {
    if (!debtName.trim() || debtAmount <= 0) return;
    if (editingDebt) {
      await updateDebtItem(editingDebt.id, debtName, debtAmount);
    } else {
      await addDebtItem(debtName, debtAmount, debtModalType);
    }
    setIsDebtModalOpen(false);
  };

  // Filtros e Totais do Mês Selecionado
  const currentMonthPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthLabel = formatMonthYear(currentDate).split(" de ")[0].toUpperCase();

  const debtsList = debtItems.filter((i) => i.type === "debt");
  const receivablesList = debtItems.filter((i) => i.type === "receivable");

  const calcRemainingTotal = (list: DebtReceivable[]) =>
    list.reduce((acc, item) => {
      const paid = debtPayments.filter((p) => p.debt_id === item.id).reduce((s, p) => s + Number(p.amount), 0);
      return acc + Math.max(0, Number(item.total_amount) - paid);
    }, 0);

  const calcMonthTotal = (list: DebtReceivable[]) => {
    const ids = new Set(list.map((i) => i.id));
    return debtPayments
      .filter((p) => ids.has(p.debt_id) && p.date.startsWith(currentMonthPrefix))
      .reduce((acc, p) => acc + Number(p.amount), 0);
  };

  const summary = useMemo(() => {
    // Filtra apenas as transações do mês selecionado no cabeçalho
    const monthTransactions = transactions.filter((tx) =>
      tx.date.startsWith(currentMonthPrefix)
    );

    const totalIncome = monthTransactions
      .filter((tx) => tx.type === "income")
      .reduce((acc, tx) => acc + Number(tx.amount), 0);

    const totalExpenses = monthTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((acc, tx) => acc + Number(tx.amount), 0);

    const totalSaved = monthTransactions
      .filter((tx) => tx.type === "investment")
      .reduce((acc, tx) => acc + Number(tx.amount), 0);

    const totalDebts = calcRemainingTotal(debtsList);
    const paidDebtsMonth = calcMonthTotal(debtsList);
    const totalReceivables = calcRemainingTotal(receivablesList);

    const monthBalance = totalIncome - totalExpenses - totalSaved - paidDebtsMonth;

    return {
      totalIncome,
      totalExpenses,
      totalSaved,
      monthBalance,
      totalDebts,
      paidDebtsMonth,
      totalReceivables,
    };
  }, [transactions, currentMonthPrefix, debtsList, receivablesList, debtPayments]);

  const CHART_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  const { statusChartData, categoryChartData } = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    // Apenas gastos do mês selecionado
    const monthExpenses = transactions.filter(
      (tx) => tx.type === "expense" && tx.date.startsWith(currentMonthPrefix)
    );

    // 1. Dados do Status das Contas (Pago, A Vencer, Vencido)
    let paid = 0;
    let pending = 0;
    let late = 0;

    monthExpenses.forEach((tx) => {
      const val = Number(tx.amount);
      if (tx.status === "paid") {
        paid += val;
      } else if (tx.date < todayStr) {
        late += val;
      } else {
        pending += val;
      }
    });

    const statusData = [
      { name: "Pago", value: paid, color: "var(--income)" },
      { name: "A vencer", value: pending, color: "var(--warning)" },
      { name: "Vencido", value: late, color: "var(--destructive)" },
    ].filter((item) => item.value > 0);

    // 2. Dados Por Categoria (somados e ordenados do maior para o menor)
    const totalsByCat = new Map<string, number>();
    monthExpenses.forEach((tx) => {
      const current = totalsByCat.get(tx.category_id) || 0;
      totalsByCat.set(tx.category_id, current + Number(tx.amount));
    });

    const catData = Array.from(totalsByCat.entries())
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          name: cat ? cat.name : "Outros",
          amount,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .map((item, index) => ({
        ...item,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));

    return { statusChartData: statusData, categoryChartData: catData };
  }, [transactions, categories, currentMonthPrefix]);

  return (
    <div className="min-h-screen flex flex-col animate-in fade-in duration-500 pb-20">

      {/* 1. TOP BAR (Cabeçalho) */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-1 bg-card px-2 py-1.5 rounded-full border border-border/50 ml-2">
            <button
              type="button"
              onClick={prevMonth}
              className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors cursor-pointer shrink-0"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center justify-center min-w-24 px-1 select-none">
              <span className="text-xs font-bold text-foreground capitalize leading-tight">
                {formatMonthYear(currentDate).split(" de ")[0]}
              </span>
              <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                {currentDate.getFullYear()}
              </span>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors cursor-pointer shrink-0"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">

        {/* Cartões de Resumo */}
        <SummaryCards {...summary} />

        {/* Gráficos */}
        <DashboardCharts
          statusData={statusChartData}
          categoryData={categoryChartData}
        />

        <div className="space-y-8">

          {/* RECEITAS */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-income mb-4">Receitas</h2>
            <div className="space-y-3">
              {categories.filter(cat => cat.type === 'income').length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhuma receita criada.</p>
              ) : (
                categories.filter(cat => cat.type === 'income').map((cat) => {
                  const catTransactions = transactions.filter(
                    tx => tx.category_id === cat.id && tx.date.startsWith(currentMonthPrefix)
                  );
                  const catTotal = catTransactions.reduce((acc, curr) => acc + Number(curr.amount), 0);

                  return (
                    <TransactionRow
                      key={cat.id}
                      id={cat.id}
                      title={cat.name}
                      type="income"
                      amount={catTotal}
                      color="var(--income)"
                      amountColor="var(--income)"
                      iconName={cat.icon}
                      transactions={catTransactions}
                      onDelete={() => handleDeleteCategory(cat.id, cat.name)}
                      onAddTransaction={handleAddTransaction}
                      onUpdateTransaction={handleUpdateTransaction}
                      onDeleteTransaction={handleDeleteTransaction}
                      onToggleStatus={toggleTransactionStatus}
                    />
                  );
                })
              )}
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

            {/* Modal: Nova Categoria */}
            <Dialog
              isOpen={isCategoryModalOpen}
              onClose={() => setIsCategoryModalOpen(false)}
              title="Nova categoria"
            >
              <div className="space-y-5 mt-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Nome</label>
                  <Input
                    placeholder="Ex: Lazer"
                    value={newCatName}
                    onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setNewCatName(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Tipo</label>
                  <select
                    value={newCatType}
                    onChange={(e) => setNewCatType(e.target.value)}
                    className="w-full h-10 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                  >
                    <option value="expense">Gasto</option>
                    <option value="investment">Investimento</option>
                    <option value="income">Receita / Salário</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Subcategoria de (opcional)</label>
                  <select
                    value={newCatParent}
                    onChange={(e) => setNewCatParent(e.target.value)}
                    className="w-full h-10 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                  >
                    <option value="">Nenhuma (categoria principal)</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="ghost"
                    className="cursor-pointer hover:bg-transparent hover:text-foreground/80 font-medium"
                    onClick={() => setIsCategoryModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="cursor-pointer font-medium px-6 rounded-xl"
                    onClick={handleSaveCategory}
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            </Dialog>

            {/* Modal de Confirmação de Exclusão */}
            <Dialog
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              title="Excluir Categoria"
            >
              <div className="space-y-5 mt-2">
                <p className="text-sm text-muted-foreground">
                  Tem a certeza que deseja excluir a categoria <strong className="text-foreground">"{categoryToDelete?.name}"</strong>? Esta ação não pode ser desfeita.
                </p>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="ghost"
                    className="cursor-pointer hover:bg-transparent hover:text-foreground/80 font-medium"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="cursor-pointer font-medium px-6 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground border-none"
                    onClick={confirmDeleteCategory}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </Dialog>

            {/* Lista de Categorias de Gastos */}
            <div className="space-y-3">
              {categories.filter(cat => cat.type === 'expense' || !cat.type).length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground bg-card/30 rounded-2xl border border-border/50">
                  Nenhum gasto criado. Clique em "+ Nova categoria" para começar.
                </div>
              ) : (
                categories.filter(cat => cat.type === 'expense' || !cat.type).map((cat) => {
                  const catTransactions = transactions.filter(
                    tx => tx.category_id === cat.id && tx.date.startsWith(currentMonthPrefix)
                  );
                  const catTotal = catTransactions.reduce((acc, curr) => acc + Number(curr.amount), 0);

                  return (
                    <TransactionRow
                      key={cat.id}
                      id={cat.id}
                      title={cat.name}
                      type={cat.type || 'expense'}
                      amount={catTotal}
                      color={cat.color}
                      iconName={cat.icon}
                      transactions={catTransactions}
                      onDelete={() => handleDeleteCategory(cat.id, cat.name)}
                      onAddTransaction={handleAddTransaction}
                      onUpdateTransaction={handleUpdateTransaction}
                      onDeleteTransaction={handleDeleteTransaction}
                      onToggleStatus={toggleTransactionStatus}
                    />
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>

      {/* INVESTIMENTOS */}
      <section className="px-6 mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#38bdf8] mb-4">Investimentos</h2>
        <div className="space-y-3">
          {categories.filter(cat => cat.type === 'investment').length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum investimento criado.</p>
          ) : (
            categories.filter(cat => cat.type === 'investment').map((cat) => {
              const catTransactions = transactions.filter(
                tx => tx.category_id === cat.id && tx.date.startsWith(currentMonthPrefix)
              );
              const catTotal = catTransactions.reduce((acc, curr) => acc + Number(curr.amount), 0);

              return (
                <TransactionRow
                  key={cat.id}
                  id={cat.id}
                  title={cat.name}
                  type="investment"
                  amount={catTotal}
                  color="#38bdf8"
                  amountColor="#38bdf8"
                  iconName={cat.icon}
                  transactions={catTransactions}
                  onDelete={() => handleDeleteCategory(cat.id, cat.name)}
                  onAddTransaction={handleAddTransaction}
                  onUpdateTransaction={handleUpdateTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  onToggleStatus={toggleTransactionStatus}
                />
              );
            })
          )}
        </div>
      </section>

      {/* DÍVIDAS */}
      <section className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4 p-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-warning">Dívidas</h2>
          <Button
            variant="outline"
            className="gap-2 h-8 border-border/50 text-xs rounded-full cursor-pointer hover:bg-accent/50"
            onClick={() => openNewDebtModal("debt")}
          >
            + Nova dívida
          </Button>
        </div>

        <div className="bg-card/30 rounded-4xl border border-border/50 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-warning/10 rounded-xl p-4 flex justify-between items-center border border-warning/20">
              <span className="text-warning font-semibold text-xs uppercase tracking-wider">TOTAL DAS DÍVIDAS</span>
              <span className="font-bold text-foreground">{formatCurrency(calcRemainingTotal(debtsList))}</span>
            </div>

            <div className="bg-destructive/10 rounded-xl p-4 flex justify-between items-center border border-destructive/20">
              <span className="text-destructive font-semibold text-xs uppercase tracking-wider">PAGO EM {currentMonthLabel}</span>
              <span className="font-bold text-foreground">{formatCurrency(calcMonthTotal(debtsList))}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground px-2 mb-4">
            O saldo das dívidas não desconta o saldo do mês. Só os pagamentos que registar aqui são descontados — e apenas no mês em que foram feitos.
          </p>

          <div className="space-y-2">
            {debtsList.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">Nenhuma dívida cadastrada.</div>
            ) : (
              debtsList.map((item) => {
                const itemPayments = debtPayments.filter((p) => p.debt_id === item.id);
                const monthCount = itemPayments.filter((p) => p.date.startsWith(currentMonthPrefix)).length;
                return (
                  <DebtRow
                    key={item.id}
                    item={item}
                    payments={itemPayments}
                    currentMonthPaymentsCount={monthCount}
                    onEditItem={openEditDebtModal}
                    onDeleteItem={setDebtToDelete}
                    onAddPayment={addDebtPayment}
                    onUpdatePayment={updateDebtPayment}
                    onDeletePayment={deleteDebtPayment}
                  />
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* DINHEIRO A RECEBER */}
      <section className="px-6">
        <div className="flex items-center justify-between mb-4 p-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-income">Dinheiro a Receber</h2>
          <Button
            variant="outline"
            className="gap-2 h-8 border-border/50 text-xs rounded-full cursor-pointer hover:bg-accent/50"
            onClick={() => openNewDebtModal("receivable")}
          >
            + Novo valor a receber
          </Button>
        </div>

        <div className="bg-card/30 rounded-4xl border border-border/50 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-income/10 rounded-xl p-4 flex justify-between items-center border border-income/20">
              <span className="text-income font-semibold text-xs uppercase tracking-wider">TOTAL A RECEBER</span>
              <span className="font-bold text-foreground">{formatCurrency(calcRemainingTotal(receivablesList))}</span>
            </div>

            <div className="bg-income/5 rounded-xl p-4 flex justify-between items-center border border-income/10 opacity-70">
              <span className="text-income font-semibold text-xs uppercase tracking-wider">RECEBIDO EM {currentMonthLabel}</span>
              <span className="font-bold text-foreground">{formatCurrency(calcMonthTotal(receivablesList))}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground px-2 mb-4">
            Esta secção é apenas um controle do dinheiro emprestado. Nenhum valor aqui entra na receita ou nos gastos do mês, nem no saldo.
          </p>

          <div className="space-y-2">
            {receivablesList.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">Nenhum valor a receber cadastrado.</div>
            ) : (
              receivablesList.map((item) => {
                const itemPayments = debtPayments.filter((p) => p.debt_id === item.id);
                const monthCount = itemPayments.filter((p) => p.date.startsWith(currentMonthPrefix)).length;
                return (
                  <DebtRow
                    key={item.id}
                    item={item}
                    payments={itemPayments}
                    currentMonthPaymentsCount={monthCount}
                    onEditItem={openEditDebtModal}
                    onDeleteItem={setDebtToDelete}
                    onAddPayment={addDebtPayment}
                    onUpdatePayment={updateDebtPayment}
                    onDeletePayment={deleteDebtPayment}
                  />
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Modal: Criar / Editar Dívida ou Valor a Receber */}
      <Dialog
        isOpen={isDebtModalOpen}
        onClose={() => setIsDebtModalOpen(false)}
        title={
          editingDebt
            ? debtModalType === "debt" ? "Editar Dívida" : "Editar Valor a Receber"
            : debtModalType === "debt" ? "Nova Dívida" : "Novo Valor a Receber"
        }
      >
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Descrição / Pessoa</label>
            <Input
              placeholder={debtModalType === "debt" ? "Ex: Empréstimo Itaú" : "Ex: Empréstimo para João"}
              value={debtName}
              onChange={(e) => setDebtName(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Valor Total</label>
            <MoneyInput value={debtAmount} onChange={setDebtAmount} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsDebtModalOpen(false)} className="cursor-pointer">
              Cancelar
            </Button>
            <Button onClick={handleSaveDebt} className="cursor-pointer px-6 rounded-xl">
              {editingDebt ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Modal: Confirmar Exclusão de Dívida / Valor a Receber */}
      <Dialog
        isOpen={!!debtToDelete}
        onClose={() => setDebtToDelete(null)}
        title="Confirmar Exclusão"
      >
        <div className="space-y-5 mt-2">
          <p className="text-sm text-muted-foreground">
            Tem a certeza que deseja excluir <strong className="text-foreground">"{debtToDelete?.name}"</strong> e todos os seus lançamentos?
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setDebtToDelete(null)} className="cursor-pointer">
              Cancelar
            </Button>
            <Button
              className="cursor-pointer px-6 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground border-none"
              onClick={async () => {
                if (debtToDelete) {
                  await deleteDebtItem(debtToDelete.id);
                  setDebtToDelete(null);
                }
              }}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}