"use client";

import { useActionState } from "react";
import { setOrganizationStatusAction } from "@/server/actions/admin";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Input, Label, Select } from "@/components/ui/Field";

export function OrganizationStatusForm({
  organizationId,
  currentStatus,
  currentNote,
}: {
  organizationId: string;
  currentStatus: string;
  currentNote: string;
}) {
  const [state, formAction] = useActionState(setOrganizationStatusAction, undefined);

  return (
    <form action={formAction} className="mt-3 flex flex-wrap items-end gap-3">
      <input type="hidden" name="organizationId" value={organizationId} />
      {state?.ok === false && (
        <div className="w-full">
          <Alert tone="error">{state.message}</Alert>
        </div>
      )}
      {state?.ok && (
        <div className="w-full">
          <Alert tone="success">{state.message}</Alert>
        </div>
      )}
      <div>
        <Label htmlFor={`status-${organizationId}`}>Status</Label>
        <Select
          id={`status-${organizationId}`}
          name="status"
          defaultValue={currentStatus}
          className="w-40"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>
      <div className="min-w-[12rem] flex-1">
        <Label htmlFor={`note-${organizationId}`}>Note (optional)</Label>
        <Input
          id={`note-${organizationId}`}
          name="note"
          defaultValue={currentNote}
          placeholder="Reason shown to the employer if rejected"
        />
      </div>
      <SubmitButton size="sm" pendingText="Saving…">
        Update
      </SubmitButton>
    </form>
  );
}
