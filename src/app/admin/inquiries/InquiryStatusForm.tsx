"use client";

import { useActionState } from "react";
import { setInquiryStatusAction } from "@/server/actions/admin";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Label, Select } from "@/components/ui/Field";

export function InquiryStatusForm({
  inquiryId,
  currentStatus,
}: {
  inquiryId: string;
  currentStatus: string;
}) {
  const [state, formAction] = useActionState(
    setInquiryStatusAction,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="inquiryId" value={inquiryId} />
      {state?.ok === false && (
        <div className="w-full">
          <Alert tone="error">{state.message}</Alert>
        </div>
      )}
      <div>
        <Label htmlFor={`inquiry-${inquiryId}`}>Status</Label>
        <Select
          id={`inquiry-${inquiryId}`}
          name="status"
          defaultValue={currentStatus}
          className="w-40"
        >
          <option value="new">New</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="spam">Spam</option>
        </Select>
      </div>
      <SubmitButton size="sm" pendingText="Saving…">
        Update
      </SubmitButton>
    </form>
  );
}
