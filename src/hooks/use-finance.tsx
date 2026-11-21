import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type?: string;
  parent_id?: string | null;
  is_fixed?: boolean;
}

export interface Transaction {
  id: string;
  category_id: string;
  description: string;
  amount: number;
  date: string;
  type: string;
  status: string;
}

export function useFinance() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchFinanceData = async () => {
      const [catRes, txRes] = await Promise.all([
        supabase
          .from("categories")
          .select("*")
          .order("created_at", { ascending: true }),
        supabase
          .from("transactions")
          .select("*")
          .order("date", { ascending: true }),
      ]);

      if (catRes.error) {
        console.error("Erro ao carregar categorias:", catRes.error);
      } else {
        setCategories(catRes.data || []);
      }

      if (txRes.error) {
        console.error("Erro ao carregar transações:", txRes.error);
      } else {
        setTransactions(txRes.data || []);
      }

      setLoading(false);
    };

    fetchFinanceData();
  }, [user]);

  //função para adicionar Transação
  const addTransaction = async (categoryId: string, description: string, amount: number, date: string, type: string) => {
    if (!user) return null;

    const newTx = {
      user_id: user.id,
      category_id: categoryId,
      description: description || "Lançamento",
      amount,
      date,
      type,
      status: type === "expense" ? "pending" : "paid", // Gastos entram pendentes para mostrar o vencimento
    };

    const { data, error } = await supabase
      .from("transactions")
      .insert([newTx])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar transação:", error);
      alert("Erro ao gravar lançamento.");
      return null;
    }

    setTransactions((prev) => [...prev, data]);
    return data;
  };

  // Atualizámos a função para receber o tipo e a subcategoria (parent_id)
  const addCategory = async (name: string, color: string, icon: string, type: string, parentId: string | null) => {
    if (!user) return null;

    const newCat = {
      user_id: user.id,
      name,
      color,
      icon,
      type,
      parent_id: parentId
    };

    const { data, error } = await supabase
      .from("categories")
      .insert([newCat])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar categoria:", error);
      alert("Erro ao criar categoria.");
      return null;
    }

    setCategories((prev) => [...prev, data]);
    return data;
  };

  // Nova função para excluir
  const deleteCategory = async (id: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id); // Apaga onde o ID for igual

    if (error) {
      console.error("Erro ao excluir categoria:", error);
      alert("Erro ao excluir categoria.");
      return false;
    }

    // Atualiza a lista na tela removendo instantaneamente a categoria excluída
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    return true;
  };

  // Atualizar lançamento existente
  const updateTransaction = async (id: string, description: string, amount: number, date: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("transactions")
      .update({
        description: description || "Lançamento",
        amount,
        date
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar transação:", error);
      alert("Erro ao atualizar lançamento.");
      return null;
    }

    setTransactions((prev) => prev.map((tx) => (tx.id === id ? data : tx)));
    return data;
  };

  // Excluir lançamento individual
  const deleteTransaction = async (id: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao excluir transação:", error);
      alert("Erro ao excluir lançamento.");
      return false;
    }

    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    return true;
  };

  // Alternar entre Pago e Pendente ao clicar em "Paguei"
  const toggleTransactionStatus = async (id: string, currentStatus: string) => {
    if (!user) return false;
    const newStatus = currentStatus === "paid" ? "pending" : "paid";

    const { data, error } = await supabase
      .from("transactions")
      .update({ status: newStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao alterar estado:", error);
      return false;
    }

    setTransactions((prev) => prev.map((tx) => (tx.id === id ? data : tx)));
    return true;
  };

  // Fixar ou desfixar uma categoria
  const toggleCategoryFixed = async (id: string, currentFixed: boolean) => {
    if (!user) return false;

    const { data, error } = await supabase
      .from("categories")
      .update({ is_fixed: !currentFixed })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao fixar categoria:", error);
      return false;
    }

    setCategories((prev) => prev.map((cat) => (cat.id === id ? data : cat)));
    return true;
  };

  // Replica automaticamente gastos de categorias fixas para o mês selecionado
  const syncFixedExpenses = async (targetDate: Date, syncedKeys: Set<string>) => {
    if (!user || loading) return;

    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
    const lastDayOfMonth = new Date(year, month, 0).getDate();

    const fixedCategories = categories.filter((cat) => cat.is_fixed);

    for (const cat of fixedCategories) {
      const syncKey = `${cat.id}-${monthPrefix}`;
      if (syncedKeys.has(syncKey)) continue;
      syncedKeys.add(syncKey);

      // Verifica se já existe lançamento desta categoria no mês selecionado
      const hasInMonth = transactions.some(
        (tx) => tx.category_id === cat.id && tx.date.startsWith(monthPrefix)
      );
      if (hasInMonth) continue;

      // Busca o lançamento mais recente anterior ao mês selecionado
      const previousTxs = transactions
        .filter((tx) => tx.category_id === cat.id && tx.date < `${monthPrefix}-01`)
        .sort((a, b) => b.date.localeCompare(a.date));

      if (previousTxs.length === 0) continue;

      const lastTx = previousTxs[0];
      const originalDay = Number(lastTx.date.split("-")[2]) || 1;
      const safeDay = Math.min(originalDay, lastDayOfMonth);
      const newDate = `${monthPrefix}-${String(safeDay).padStart(2, "0")}`;

      await addTransaction(
        cat.id,
        lastTx.description,
        Number(lastTx.amount),
        newDate,
        cat.type || "expense"
      );
    }
  };



  return {
    categories,
    transactions, // Exportar
    loadingCategories: loading,
    addCategory,
    deleteCategory,
    addTransaction, // Exportar
    updateTransaction,
    deleteTransaction,
    toggleTransactionStatus,
    toggleCategoryFixed,
    syncFixedExpenses
  };
}