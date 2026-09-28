"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isTimezone, normalizeDomain, validateSiteName } from "@/lib/sites";
import { createClient } from "@/lib/supabase/server";

export type SiteFormState = {
  error?: string;
  fieldErrors?: { name?: string; domain?: string; timezone?: string };
  saved?: boolean;
  values?: { name: string; domain: string; timezone: string };
};

function read(formData: FormData) {
  const get = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };
  return { name: get("name"), domain: get("domain"), timezone: get("timezone") || "UTC", siteId: get("siteId") };
}

function validate(values: { name: string; domain: string; timezone: string }) {
  const name = validateSiteName(values.name);
  const domain = normalizeDomain(values.domain);
  const fieldErrors: SiteFormState["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Give your site a name (up to 80 characters).";
  if (!domain) fieldErrors.domain = "Enter a domain like example.com.";
  if (!isTimezone(values.timezone)) fieldErrors.timezone = "Choose a timezone from the list.";
  return { name, domain, fieldErrors };
}

function duplicateDomain(error: { code?: string; message: string }) {
  return error.code === "23505" && /domain/.test(error.message);
}

export async function createSite(_: SiteFormState, formData: FormData): Promise<SiteFormState> {
  await requireUser();
  const values = read(formData);
  const { name, domain, fieldErrors } = validate(values);
  if (!name || !domain || Object.keys(fieldErrors).length) return { fieldErrors, values };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sites")
    .insert({ name, domain, timezone: values.timezone })
    .select("id")
    .single();

  if (error) {
    if (duplicateDomain(error)) return { fieldErrors: { domain: "You already have a site with this domain." }, values };
    console.error("tinylytics: create site failed", error.message);
    return { error: "We couldn't create the site. Please try again.", values };
  }

  (await cookies()).set("tl_site", data.id, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  redirect(`/sites/${data.id}/settings/tracking?new=1`);
}

export async function updateSite(_: SiteFormState, formData: FormData): Promise<SiteFormState> {
  await requireUser();
  const values = read(formData);
  const { name, domain, fieldErrors } = validate(values);
  if (!name || !domain || Object.keys(fieldErrors).length) return { fieldErrors, values };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sites")
    .update({ name, domain, timezone: values.timezone })
    .eq("id", values.siteId)
    .select("id");

  if (error) {
    if (duplicateDomain(error)) return { fieldErrors: { domain: "You already have a site with this domain." }, values };
    console.error("tinylytics: update site failed", error.message);
    return { error: "We couldn't save your changes. Please try again.", values };
  }
  if (!data.length) return { error: "This site no longer exists.", values };

  revalidatePath(`/sites/${values.siteId}`, "layout");
  return { saved: true, values: { name, domain, timezone: values.timezone } };
}

export async function regenerateSiteId(formData: FormData) {
  await requireUser();
  const siteId = String(formData.get("siteId") ?? "");
  const supabase = await createClient();
  const { data: publicId, error: idError } = await supabase.rpc("tinylytics_public_id");
  if (idError) throw new Error("Could not generate a new site ID.");
  const { error } = await supabase.from("sites").update({ public_id: publicId }).eq("id", siteId);
  if (error) throw new Error("Could not update the site ID.");
  revalidatePath(`/sites/${siteId}`, "layout");
}

export async function deleteSite(formData: FormData) {
  await requireUser();
  const siteId = String(formData.get("siteId") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.from("sites").delete().eq("id", siteId);
  if (error) throw new Error("Could not delete the site.");
  const jar = await cookies();
  if (jar.get("tl_site")?.value === siteId) jar.delete("tl_site");
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
