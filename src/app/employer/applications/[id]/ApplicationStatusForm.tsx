"use client";

import { useActionState } from "react";
import { updateApplicationStatusAction } from "@/server/actions/employer";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Field, Label, Select, Textarea } from "@/components/ui/Field";

const OPTIONS = [
  { value: "under_review", label: "Under review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "offered", label: "Offer made" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Not selected" },
];

export function ApplicationStatusForm({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: string;
}) {
  const [state, formAction] = useActionState(updateApplicationStatusAction, undefined);

  return (
    <form action={formAction}>
      <input type="hidden" name="applicationId" value={applicationId} />
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Field className="mb-0">
          <Label htmlFor="status" required>
            New status
          </Label>
          <Select
            id="status"
            name="status"
            defaultValue={currentStatus}
            required
          >
            {OPTIONS.filter((o) => o.value !== currentStatus).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <Field className="mb-0">
            <Label htmlFor="note">Note to candidate (optional)</Label>
            <Textarea
              id="note"
              name="note"
              rows={3}
              placeholder="This note is included in the status-change email."
            />
          </Field>
        </div>
      </div>

      <SubmitButton pendingText="Updating…" className="mt-4">
        Update status
      </SubmitButton>

      {state?.ok === false && state.fieldErrors && (
        <div className="mt-3">
          {Object.entries(state.fieldErrors).map(([k, v]) => (
            <p key={k} className="text-sm font-medium text-danger">
              {v}
            </p>
          ))}
        </div>
      )}
    </form>
  );
}
