"use client";

import { useActionState } from "react";
import {
  setUserActiveAction,
  setUserRoleAction,
} from "@/server/actions/admin";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Select } from "@/components/ui/Field";

export function UserControls({
  userId,
  role,
  isActive,
}: {
  userId: string;
  role: string;
  isActive: boolean;
}) {
  const [roleState, roleAction] = useActionState(setUserRoleAction, undefined);
  const [activeState, activeAction] = useActionState(setUserActiveAction, undefined);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {(roleState?.ok === false || activeState?.ok === false) && (
        <div className="w-full">
          <Alert tone="error">
            {roleState?.ok === false ? roleState.message : ""}
            {activeState?.ok === false ? activeState.message : ""}
          </Alert>
        </div>
      )}
      <form action={roleAction} className="flex items-center gap-2">
        <input type="hidden" name="userId" value={userId} />
        <Select name="role" defaultValue={role} className="w-36" aria-label="Role">
          <option value="candidate">Candidate</option>
          <option value="employer">Employer</option>
          <option value="recruiter">Recruiter</option>
          <option value="admin">Admin</option>
        </Select>
        <SubmitButton size="sm" variant="outline" pendingText="…">
          Set role
        </SubmitButton>
      </form>
      <form action={activeAction}>
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="isActive" value={isActive ? "false" : "true"} />
        <SubmitButton
          size="sm"
          variant={isActive ? "danger" : "primary"}
          pendingText="…"
        >
          {isActive ? "Deactivate" : "Activate"}
        </SubmitButton>
      </form>
    </div>
  );
}
