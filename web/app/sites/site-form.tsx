"use client";

import { useActionState, useSyncExternalStore } from "react";
import { Field, FormMessage, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Site } from "@/types/database";
import { createSite, updateSite, type SiteFormState } from "./actions";

const noopSubscribe = () => () => {};
function browserTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

export function SiteForm({ mode, site, timezones }: { mode: "create" | "edit"; site?: Site; timezones: string[] }) {
  const [state, action] = useActionState<SiteFormState, FormData>(mode === "create" ? createSite : updateSite, {});
  // The visitor's own timezone is a good default for a new site. Only known in the browser.
  const detectedZone = useSyncExternalStore(noopSubscribe, browserTimezone, () => null);

  const values = state.values ?? {
    name: site?.name ?? "",
    domain: site?.domain ?? "",
    timezone: site?.timezone ?? (timezones.includes(detectedZone ?? "") ? detectedZone! : "UTC"),
  };
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5" noValidate>
      {site ? <input type="hidden" name="siteId" value={site.id} /> : null}
      <Field label="Name" htmlFor="name" error={errors.name} hint="Only you see this.">
        <Input
          id="name"
          name="name"
          defaultValue={values.name}
          maxLength={80}
          required
          placeholder="My product"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : "name-hint"}
        />
      </Field>
      <Field
        label="Domain"
        htmlFor="domain"
        error={errors.domain}
        hint="Without https:// or www. Subdomains are included automatically."
      >
        <Input
          id="domain"
          name="domain"
          defaultValue={values.domain}
          required
          placeholder="example.com"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          inputMode="url"
          className="font-mono"
          aria-invalid={Boolean(errors.domain)}
          aria-describedby={errors.domain ? "domain-error" : "domain-hint"}
        />
      </Field>
      <Field
        label="Timezone"
        htmlFor="timezone"
        error={errors.timezone}
        hint="Days in your reports start at midnight in this timezone."
      >
        <Select
          id="timezone"
          name="timezone"
          key={values.timezone}
          defaultValue={values.timezone}
          aria-invalid={Boolean(errors.timezone)}
          aria-describedby={errors.timezone ? "timezone-error" : "timezone-hint"}
        >
          {timezones.map((zone) => (
            <option key={zone} value={zone}>
              {zone.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
      </Field>
      <FormMessage>{state.error}</FormMessage>
      {state.saved ? <FormMessage tone="success">Saved.</FormMessage> : null}
      <SubmitButton pendingLabel={mode === "create" ? "Creating…" : "Saving…"}>
        {mode === "create" ? "Create site" : "Save changes"}
      </SubmitButton>
    </form>
  );
}
