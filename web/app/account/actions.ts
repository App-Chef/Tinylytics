"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AccountState = { error?: string; message?: string };

export async function updateProfile(_: AccountState, formData: FormData): Promise<AccountState> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "")
    .trim()
    .slice(0, 100);
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ name: name || null })
    .eq("id", user.id);
  if (error) return { error: "We couldn't save your name. Please try again." };
  revalidatePath("/account");
  return { message: "Saved." };
}

export async function updatePassword(_: AccountState, formData: FormData): Promise<AccountState> {
  await requireUser();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: "Use at least 8 characters." };
  if (password !== confirm) return { error: "The passwords don't match." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { message: "Your password has been updated." };
}

export async function deleteAccount() {
  const user = await requireUser();
  // Deleting the auth user cascades to the profile, sites and all analytics data.
  const { error } = await createAdminClient().auth.admin.deleteUser(user.id);
  if (error) throw new Error("Could not delete the account.");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
