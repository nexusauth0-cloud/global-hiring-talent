"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/server/actions/auth";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Field, FieldError, Input, Label } from "@/components/ui/Field";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPasswordAction, undefined);
  const errors = state?.ok === false ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} noValidate>
      <h1 className="text-2xl font-extrabold text-brand-900">Choose a new password</h1>

      {state && (
        <div className="mt-5">
          <Alert
            tone={state.ok ? "success" : "error"}
            title={state.ok ? "Password updated" : "Could not reset password"}
          >
            {state.message}
          </Alert>
        </div>
      )}

      {state?.ok ? (
        <p className="mt-6 text-sm text-slate-600">
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Continue to sign in
          </Link>
        </p>
      ) : (
        <>
          <input type="hidden" name="token" value={token} />
          <Field className="mt-6">
            <Label htmlFor="password" required>
              New password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={10}
              invalid={Boolean(errors.password)}
            />
            <FieldError id="password-error" message={errors.password} />
          </Field>
          <Field>
            <Label htmlFor="confirmPassword" required>
              Confirm new password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              invalid={Boolean(errors.confirmPassword)}
            />
            <FieldError id="confirm-error" message={errors.confirmPassword} />
          </Field>
          <SubmitButton pendingText="Updating…" className="w-full" size="lg">
            Update password
          </SubmitButton>
        </>
      )}
    </form>
  );
}
