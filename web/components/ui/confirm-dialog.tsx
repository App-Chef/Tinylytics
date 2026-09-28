"use client";

import { useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { buttonClass } from "./button";
import { Input } from "./field";

/**
 * A destructive action behind a native <dialog>. The user must type
 * `confirmText` before the submit button enables.
 */
export function ConfirmDialog({
  triggerLabel,
  title,
  description,
  confirmText,
  confirmLabel,
  action,
  hiddenFields,
}: {
  triggerLabel: string;
  title: string;
  description: ReactNode;
  confirmText: string;
  confirmLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields?: Record<string, string>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState("");
  const id = `confirm-${confirmText.replace(/\W+/g, "-")}`;

  return (
    <>
      <button type="button" className={buttonClass("danger", "md")} onClick={() => ref.current?.showModal()}>
        {triggerLabel}
      </button>
      <dialog
        ref={ref}
        aria-labelledby={`${id}-title`}
        onClose={() => setTyped("")}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border-[1.5px] border-ink bg-surface p-0 text-ink shadow-hard backdrop:bg-black/40 open:animate-[tl-rise_200ms_var(--ease-out)]"
      >
        <form action={action} className="space-y-4 p-6">
          {Object.entries(hiddenFields ?? {}).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <h2 id={`${id}-title`} className="font-display text-xl font-bold">
            {title}
          </h2>
          <div className="text-sm text-ink-2">{description}</div>
          <div className="space-y-1.5">
            <label htmlFor={id} className="block text-sm font-semibold">
              Type <span className="font-mono">{confirmText}</span> to confirm
            </label>
            <Input
              id={id}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" className={buttonClass("ghost", "md")} onClick={() => ref.current?.close()}>
              Cancel
            </button>
            <Submit disabled={typed.trim() !== confirmText}>{confirmLabel}</Submit>
          </div>
        </form>
      </dialog>
    </>
  );
}

function Submit({ disabled, children }: { disabled: boolean; children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={disabled || pending} className={buttonClass("danger", "md")}>
      {pending ? "Deleting…" : children}
    </button>
  );
}
