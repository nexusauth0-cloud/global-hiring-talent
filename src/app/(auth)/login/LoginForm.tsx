"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/server/actions/auth";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Field, FieldError, Input, Label } from "@/components/ui/Field";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} noValidate>
      <h1 className="text-2xl font-extrabold text-brand-900">Welcome back</h1>
      <p className="mt-1.5 text-sm text-slate-600">
        Sign in to manage your applications or hiring activity.
      </p>

      {state?.ok === false && (
        <div className="mt-5">
          <Alert tone="error" title="Sign-in failed">
            {state.message}
          </Alert>
        </div>
      )}

      {next && <input type="hidden" name="next" value={next} />}

      <div className="mt-6">
        <Field>
          <Label htmlFor="email" required>
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            invalid={Boolean(state?.ok === false && state.fieldErrors?.email)}
            aria-describedby={
              state?.ok === false && state.fieldErrors?.email ? "email-error" : undefined
            }
          />
          <FieldError
            id="email-error"
            message={state?.ok === false ? state.fieldErrors?.email : undefined}
          />
        </Field>

        <Field>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="password" required className="mb-0">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            invalid={Boolean(state?.ok === false && state.fieldErrors?.password)}
          />
          <FieldError
            id="password-error"
            message={state?.ok === false ? state.fieldErrors?.password : undefined}
          />
        </Field>
      </div>

      <SubmitButton pendingText="Signing in…" className="w-full" size="lg">
        Sign in
      </SubmitButton>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href="/register/candidate" className="font-semibold text-brand-700 hover:underline">
          Register as a candidate
        </Link>
        {" or "}
        <Link href="/register/employer" className="font-semibold text-brand-700 hover:underline">
          as an employer
        </Link>
        .
      </p>
    </form>
  );
}
