"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

// Admin client untuk bypass RLS & manage users
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function createTenantAction(formData: {
  email: string;
  password?: string;
  fullName: string;
  businessName: string;
  storeName: string;
}) {
  try {
    // 1. Create Auth User
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: formData.password || "Password123!", // Default password if not provided
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

export async function updateTenantAction(
  businessId: string,
  userId: string,
  data: {
    email: string;
    password?: string;
    fullName: string;
    businessName: string;
  }
) {
  try {
    // 1. Update Auth User (Email & Password if provided)
    const updateParams: any = { email: data.email };
    if (data.password && data.password.trim() !== "") {
      updateParams.password = data.password;
    }
    
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      updateParams
    );
    if (authError) throw authError;

    // 2. Update Business
    const { error: bizError } = await supabaseAdmin
      .from("businesses")
      .update({ name: data.businessName })
      .eq("id", businessId);
    if (bizError) throw bizError;

    // 3. Update Profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ full_name: data.fullName })
      .eq("id", userId);
    if (profileError) throw profileError;

    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating tenant:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteTenantAction(businessId: string, userId: string) {
  try {
    // 1. Hapus Bisnis (akan menghapus cabang, produk, transaksi, dll karena ON DELETE CASCADE)
    const { error: bizError } = await supabaseAdmin
      .from("businesses")
      .delete()
      .eq("id", businessId);
    if (bizError) throw bizError;

    // 2. Hapus Auth User (akan menghapus profil secara cascade juga)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting tenant:", err);
    return { success: false, error: err.message };
  }
}

export async function getTenantsAction() {
  try {
    // 1. Get all businesses
    const { data: businesses, error: bizError } = await supabaseAdmin
      .from("businesses")
      .select(`
        id,
        name,
        created_at,
        owner_id
      `);
    if (bizError) throw bizError;

    // 2. Get all profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, role");
    if (profileError) throw profileError;

    // 3. Get all auth users to retrieve emails
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // 4. Get store counts
    const { data: stores, error: storesError } = await supabaseAdmin
      .from("stores")
      .select("id, business_id");
    if (storesError) throw storesError;

    // Map everything together
    const tenantsList = (businesses || []).map((biz: any) => {
      const ownerProfile = profiles?.find((p: any) => p.id === biz.owner_id);
      const authUser = users?.find((u: any) => u.id === biz.owner_id);
      const storeCount = stores?.filter((s: any) => s.business_id === biz.id).length || 0;

      return {
        id: biz.id,
        owner_id: biz.owner_id || "",
        owner_email: authUser?.email || "Tidak ada email",
        name: biz.name,
        owner_name: ownerProfile?.full_name || "Pemilik Bisnis",
        store_count: storeCount,
        created_at: new Date(biz.created_at).toLocaleDateString("id-ID"),
        status: "active" as const
      };
    });

    return { success: true, tenants: tenantsList };
  } catch (err: any) {
    console.error("Error getting tenants:", err);
    return { success: false, error: err.message };
  }
}
