"use client";

import { useActionState } from "react";
import { Field, FormMessage, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { updatePassword, updateProfile, type AccountState } from "./actions";

export function ProfileForm({ name }: { name: string }) {
  const [state, action] = useActionState<AccountState, FormData>(updateProfile, {});
  return (
    <form action={action} className="space-y-4">
      <Field label="Name" htmlFor="name">
        <Input id="name" name="name" defaultValue={name} maxLength={100} autoComplete="name" />
      </Field>
      <FormMessage>{state.error}</FormMessage>
      <FormMessage tone="success">{state.message}</FormMessage>
      <SubmitButton variant="secondary">Save</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState<AccountState, FormData>(updatePassword, {});
  return (
    <form action={action} className="space-y-4">
      <Field label="New password" htmlFor="password" hint="At least 8 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      <Field label="Confirm new password" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      <FormMessage>{state.error}</FormMessage>
      <FormMessage tone="success">{state.message}</FormMessage>
      <SubmitButton pendingLabel="Updating…">Update password</SubmitButton>
    </form>
  );
}
