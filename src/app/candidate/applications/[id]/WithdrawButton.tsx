"use client";

import { useActionState } from "react";
import { withdrawApplicationAction } from "@/server/actions/candidate";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function WithdrawButton({ applicationId }: { applicationId: string }) {
  const [state, formAction] = useActionState(withdrawApplicationAction, undefined);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          !window.confirm(
            "Withdraw this application? This action cannot be undone."
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="applicationId" value={applicationId} />
      {state?.ok === false && (
        <div className="mb-3">
          <Alert tone="error">{state.message}</Alert>
        </div>
      )}
      <SubmitButton variant="danger" pendingText="Withdrawing…">
        Withdraw application
      </SubmitButton>
    </form>
  );
}
