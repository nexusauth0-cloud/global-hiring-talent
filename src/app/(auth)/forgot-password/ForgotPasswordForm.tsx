"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "@/server/actions/auth";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Field, Input, Label } from "@/components/ui/Field";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, undefined);

  return (
    <form action={formAction} noValidate>
      <h1 className="text-2xl font-extrabold text-brand-900">Reset your password</h1>
      <p className="mt-1.5 text-sm text-slate-600">
        Enter your email and we&apos;ll send reset instructions if an account exists.
      </p>

      {state && (
        <div className="mt-5">
          <Alert tone={state.ok ? "success" : "error"} title={state.ok ? "Check your inbox" : "Something went wrong"}>
            {state.message}
          </Alert>
        </div>
      )}

      <Field className="mt-6">
        <Label htmlFor="email" required>
          Email address
        </Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>

      <SubmitButton pendingText="Sending…" className="w-full" size="lg">
        Send reset instructions
      </SubmitButton>
    </form>
  );
}
