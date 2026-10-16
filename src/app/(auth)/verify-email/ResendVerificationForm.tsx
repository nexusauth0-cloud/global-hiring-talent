"use client";

import { useActionState } from "react";
import { resendVerificationAction } from "@/server/actions/auth";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function ResendVerificationForm() {
  const [state, formAction] = useActionState(resendVerificationAction, undefined);

  return (
    <form action={formAction} className="mt-5">
      {state && (
        <div className="mb-4">
          <Alert tone={state.ok ? "success" : "error"}>{state.message}</Alert>
        </div>
      )}
      <SubmitButton pendingText="Sending…">Resend verification email</SubmitButton>
    </form>
  );
}
