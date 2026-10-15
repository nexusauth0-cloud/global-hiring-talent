"use client";

import { useActionState } from "react";
import { moderateReviewAction } from "@/server/actions/admin";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function ReviewModerationForm({
  reviewId,
  currentStatus,
}: {
  reviewId: string;
  currentStatus: string;
}) {
  const [state, formAction] = useActionState(moderateReviewAction, undefined);
  const actions: { status: string; label: string; variant: "primary" | "outline" | "danger" }[] =
    [
      { status: "approved", label: "Approve", variant: "primary" },
      { status: "rejected", label: "Reject", variant: "danger" },
      { status: "pending", label: "Set pending", variant: "outline" },
    ];

  return (
    <div>
      {state?.ok && (
        <div className="mb-3">
          <Alert tone="success">{state.message}</Alert>
        </div>
      )}
      {state?.ok === false && (
        <div className="mb-3">
          <Alert tone="error">{state.message}</Alert>
        </div>
      )}
      <div className="flex flex-wrap items-end gap-3">
        {actions
          .filter((a) => a.status !== currentStatus)
          .map((a) => (
            <form key={a.status} action={formAction}>
              <input type="hidden" name="reviewId" value={reviewId} />
              <input type="hidden" name="status" value={a.status} />
              <SubmitButton size="sm" variant={a.variant} pendingText="Saving…">
                {a.status === "approved"
                  ? "Approve"
                  : a.status === "rejected"
                    ? "Reject"
                    : "Reset"}
              </SubmitButton>
            </form>
          ))}
      </div>
    </div>
  );
}
