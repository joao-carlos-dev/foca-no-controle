import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface DebtReceivable {
  id: string;
  name: string;
  total_amount: number;
  type: "debt" | "receivable";
}

export interface DebtPayment {
  id: string;
  debt_id: string;
  amount: number;
  description: string;
  date: string;
}

export function useDebts() {
  const { user } = useAuth();
  const [items, setItems] = useState<DebtReceivable[]>([]);
  const [payments, setPayments] = useState<DebtPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      const [itemsRes, paymentsRes] = await Promise.all([
        supabase.from("debts_receivables").select("*").order("created_at", { ascending: true }),
        supabase.from("debt_payments").select("*").order("date", { ascending: false }),
      ]);

      if (!itemsRes.error) setItems(itemsRes.data || []);
      if (!paymentsRes.error) setPayments(paymentsRes.data || []);
      setLoading(false);
    };

    fetchAll();
  }, [user]);

  const addItem = async (name: string, totalAmount: number, type: "debt" | "receivable") => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("debts_receivables")
      .insert([{ user_id: user.id, name, total_amount: totalAmount, type }])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar registo:", error);
      return null;
    }
    setItems((prev) => [...prev, data]);
    return data;
  };

  const updateItem = async (id: string, name: string, totalAmount: number) => {
    if (!user) return false;
    const { data, error } = await supabase
      .from("debts_receivables")
      .update({ name, total_amount: totalAmount })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar registo:", error);
      return false;
    }
    setItems((prev) => prev.map((item) => (item.id === id ? data : item)));
    return true;
  };

  const deleteItem = async (id: string) => {
    if (!user) return false;
    const { error } = await supabase.from("debts_receivables").delete().eq("id", id);
    if (error) {
      console.error("Erro ao excluir registo:", error);
      return false;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
    setPayments((prev) => prev.filter((p) => p.debt_id !== id));
    return true;
  };

  const addPayment = async (debtId: string, amount: number, description: string, date: string) => {
    if (!user) return false;
    const { data, error } = await supabase
      .from("debt_payments")
      .insert([{ user_id: user.id, debt_id: debtId, amount, description: description || "Pagamento", date }])
      .select()
      .single();

    if (error) {
      console.error("Erro ao registar lançamento:", error);
      return false;
    }
    setPayments((prev) => [data, ...prev]);
    return true;
  };

  const updatePayment = async (id: string, amount: number, description: string, date: string) => {
    if (!user) return false;
    const { data, error } = await supabase
      .from("debt_payments")
      .update({ amount, description: description || "Pagamento", date })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao editar lançamento:", error);
      return false;
    }
    setPayments((prev) => prev.map((p) => (p.id === id ? data : p)));
    return true;
  };

  const deletePayment = async (id: string) => {
    if (!user) return false;
    const { error } = await supabase.from("debt_payments").delete().eq("id", id);
    if (error) {
      console.error("Erro ao excluir lançamento:", error);
      return false;
    }
    setPayments((prev) => prev.filter((p) => p.id !== id));
    return true;
  };

  return {
    items,
    payments,
    loading,
    addItem,
    updateItem,
    deleteItem,
    addPayment,
    updatePayment,
    deletePayment,
  };
}