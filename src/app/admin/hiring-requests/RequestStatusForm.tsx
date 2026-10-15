"use client";

import { useActionState } from "react";
import { setHiringRequestStatusAction } from "@/server/actions/admin";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Input, Label, Select } from "@/components/ui/Field";

export function RequestStatusForm({
  requestId,
  currentStatus,
  currentNote,
}: {
  requestId: string;
  currentStatus: string;
  currentNote: string;
}) {
  const [state, formAction] = useActionState(setHiringRequestStatusAction, undefined);

  return (
    <form action={formAction} className="mt-3 flex flex-wrap items-end gap-3">
      <input type="hidden" name="requestId" value={requestId} />
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
        <Label htmlFor={`status-${requestId}`}>Status</Label>
        <Select
          id={`status-${requestId}`}
          name="status"
          defaultValue={currentStatus}
          className="w-44"
        >
          <option value="new">New</option>
          <option value="in_progress">In progress</option>
          <option value="quote_sent">Quote sent</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>
      <div className="min-w-[12rem] flex-1">
        <Label htmlFor={`note-${requestId}`}>Note (optional)</Label>
        <Input
          id={`note-${requestId}`}
          name="note"
          defaultValue={currentNote}
        />
      </div>
      <SubmitButton size="sm" pendingText="Saving…">
        Update
      </SubmitButton>
    </form>
  );
}
