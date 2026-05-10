"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createTransaction(txData: any, items: any[]) {
  // 1. Insert Transaction
  const { data: transaction, error: txError } = await supabase
    .from("transactions")
    .insert([txData])
    .select()
    .single();

  if (txError) throw txError;

  // 2. Insert Transaction Items
  const transactionItems = items.map(item => ({
    transaction_id: transaction.id,
    product_id: item.id,
    quantity: item.quantity,
    unit_price: item.price,
    subtotal: item.price * item.quantity
  }));

  const { error: itemsError } = await supabase
    .from("transaction_items")
    .insert(transactionItems);

  if (itemsError) throw itemsError;

  // 3. Insert Stock Logs (Audit Trail)
  const stockLogs = items.map(item => ({
    product_id: item.id,
    change_amount: -item.quantity,
    type: 'sale',
    notes: `Penjualan di POS (ID: ${transaction.id})`
  }));

  await supabase.from("stock_logs").insert(stockLogs);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pos");
  
  return transaction;
}

export async function getRecentTransactions(limit = 5) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return data;
}
