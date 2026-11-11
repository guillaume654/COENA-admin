"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import type { Dictionary } from "@/lib/i18n";

export function LoginForm({
  t,
  next,
  notice,
  disabled,
}: {
  t: Dictionary["auth"];
  next?: string;
  notice?: string;
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  const message = state.error ? t.errors[state.error] : notice;

  return (
    <form action={action} className="mt-6 space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      {message && (
        <p role="alert" className="rounded-md border border-brand/30 bg-brand-soft px-3 py-2 text-sm text-brand-fine">
          {message}
        </p>
      )}

      <div>
        <label htmlFor="login" className="mb-1 block text-sm font-medium">
          {t.login}
        </label>
        <input
          id="login"
          name="login"
          defaultValue={state.login}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          disabled={disabled}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-base outline-none focus:border-brand disabled:opacity-60"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          {t.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus={!!state.login}
          required
          disabled={disabled}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-base outline-none focus:border-brand disabled:opacity-60"
        />
      </div>

      <button
        type="submit"
        disabled={pending || disabled}
        className="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? t.submitting : t.submit}
      </button>
    </form>
  );
}
