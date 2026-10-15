"use client";

import { useActionState } from "react";
import { setJobStatusAction } from "@/server/actions/employer";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";

const TRANSITIONS: { status: string; label: string; variant: "primary" | "outline" | "danger" }[] = [
  { status: "published", label: "Publish", variant: "primary" },
  { status: "draft", label: "Move to draft", variant: "outline" },
  { status: "closed", label: "Close", variant: "outline" },
  { status: "archived", label: "Archive", variant: "danger" },
];

export function JobStatusForm({
  jobId,
  currentStatus,
}: {
  jobId: string;
  currentStatus: string;
}) {
  const [state, formAction] = useActionState(setJobStatusAction, undefined);

  return (
    <div>
      {state?.ok && (
        <div className="mb-4">
          <Alert tone="success">{state.message}</Alert>
        </div>
      )}
      {state?.ok === false && (
        <div className="mb-4">
          <Alert tone="error">{state.message}</Alert>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {TRANSITIONS.filter((t) => t.status !== currentStatus).map((t) => (
          <form key={t.status} action={formAction}>
            <input type="hidden" name="jobId" value={jobId} />
            <input type="hidden" name="status" value={t.status} />
            <SubmitButton variant={t.variant} size="sm" pendingText="Updating…">
              {t.label}
            </SubmitButton>
          </form>
        ))}
      </div>
    </div>
  );
}
