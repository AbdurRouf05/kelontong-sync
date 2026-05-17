"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client untuk bypass RLS & manage users
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function createTenantAction(formData: {
  email: string;
  fullName: string;
  businessName: string;
  storeName: string;
}) {
  try {
    // 1. Create Auth User
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: "Password123!", // Default password, ask them to change
      email_confirm: true
    });

    if (authError) throw authError;
    const userId = authUser.user.id;

    // 2. Create Business
    const { data: business, error: bizError } = await supabaseAdmin
      .from("businesses")
      .insert({
        name: formData.businessName,
        owner_id: userId
      })
      .select()
      .single();
    
    if (bizError) throw bizError;

    // 3. Create First Store
    const { data: store, error: storeError } = await supabaseAdmin
      .from("stores")
      .insert({
        business_id: business.id,
        name: formData.storeName,
        address: "Alamat belum diatur"
      })
      .select()
      .single();

    if (storeError) throw storeError;

    // 4. Create Profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        business_id: business.id,
        current_store_id: store.id,
        full_name: formData.fullName,
        role: "owner"
      });

    if (profileError) throw profileError;

    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    console.error("Error creating tenant:", err);
    return { success: false, error: err.message };
  }
}
