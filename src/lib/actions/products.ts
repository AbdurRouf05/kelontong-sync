"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data;
}

export async function createProduct(formData: any) {
  const { data, error } = await supabase
    .from("products")
    .insert([formData])
    .select();

  if (error) throw error;
  
  revalidatePath("/dashboard/inventory");
  return data;
}

export async function updateProduct(id: string, formData: any) {
  const { data, error } = await supabase
    .from("products")
    .update(formData)
    .eq("id", id)
    .select();

  if (error) throw error;

  revalidatePath("/dashboard/inventory");
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/dashboard/inventory");
}
