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

    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Erro ao carregar categorias:", error);
      } else {
        setCategories(data || []);
      }
      setLoading(false);
    };

    fetchCategories();
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

  return {
    categories,
    transactions, // Exportar
    loadingCategories: loading,
    addCategory,
    deleteCategory,
    addTransaction, // Exportar
    updateTransaction,
    deleteTransaction,
    toggleTransactionStatus
  };
}