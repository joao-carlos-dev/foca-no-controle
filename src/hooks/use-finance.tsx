import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export function useFinance() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Ir buscar as categorias
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

  // 2. Guardar nova categoria
  const addCategory = async (name: string, color: string, icon: string) => {
    if (!user) return null;

    const newCat = {
      user_id: user.id,
      name,
      color,
      icon,
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

    // Atualiza a lista no ecrã imediatamente
    setCategories((prev) => [...prev, data]);
    return data;
  };

  return {
    categories,
    loadingCategories: loading,
    addCategory,
  };
}