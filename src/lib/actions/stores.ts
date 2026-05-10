"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getStoreProfile(storeId: string) {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("id", storeId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateStoreProfile(storeId: string, formData: any) {
  const { data, error } = await supabase
    .from("stores")
    .update(formData)
    .eq("id", storeId)
    .select();

  if (error) throw error;

  revalidatePath("/dashboard/settings/store");
  return data;
}

export async function getBranchesByOwner(ownerId: string) {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", ownerId);

  if (error) throw error;
  return data;
}
