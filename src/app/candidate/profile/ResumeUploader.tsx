"use client";

import { useActionState, useRef } from "react";
import { Upload } from "lucide-react";
import { uploadResumeAction } from "@/server/actions/candidate";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FieldError, Hint } from "@/components/ui/Field";

export function ResumeUploader({ hasResume }: { hasResume: boolean }) {
  const [state, formAction] = useActionState(uploadResumeAction, undefined);
  const errors = state?.ok === false ? state.fieldErrors ?? {} : {};
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction}>
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

      <label
        htmlFor="resume"
        className="mb-1.5 block text-sm font-semibold text-brand-900"
      >
        {hasResume ? "Replace your CV" : "Upload your CV"}
        <span className="ml-1 text-danger" aria-hidden="true">
          *
        </span>
      </label>
      <input
        id="resume"
        name="resume"
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        required
        aria-describedby="resume-hint resume-error"
        className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-white text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-l-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-brand-800 hover:file:bg-brand-100"
      />
      <Hint id="resume-hint">
        PDF, DOC or DOCX. Maximum 5 MB. Stored privately and never publicly
        accessible.
      </Hint>
      <FieldError id="resume-error" message={errors.resume} />

      <SubmitButton pendingText="Uploading…" className="mt-4">
        <Upload className="h-4 w-4" aria-hidden="true" />
        {hasResume ? "Replace CV" : "Upload CV"}
      </SubmitButton>
    </form>
  );
}
