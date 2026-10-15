"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, FileText, LogIn } from "lucide-react";
import { submitApplicationAction } from "@/server/actions/candidate";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ButtonLink } from "@/components/ui/Button";
import {
  Checkbox,
  Field,
  FieldError,
  Input,
  Label,
  Textarea,
} from "@/components/ui/Field";

export type ApplyPanelProps = {
  jobId: string;
  isLoggedIn: boolean;
  isCandidate: boolean;
  hasResume: boolean;
  alreadyApplied: boolean;
  defaultEmail?: string;
  defaultPhone?: string;
};

export function ApplyPanel({
  jobId,
  isLoggedIn,
  isCandidate,
  hasResume,
  alreadyApplied,
  defaultEmail = "",
  defaultPhone = "",
}: ApplyPanelProps) {
  const [state, formAction] = useActionState(submitApplicationAction, undefined);
  const errors = state?.ok === false ? state.fieldErrors ?? {} : {};

  if (alreadyApplied || state?.ok) {
    return (
      <Alert tone="success" title="Application submitted">
        <p>
          {state?.ok
            ? state.message
            : "You have already applied for this position."}
        </p>
        <p className="mt-2">
          <Link
            href="/candidate/applications"
            className="font-semibold underline"
          >
            Track your applications
          </Link>
        </p>
      </Alert>
    );
  }

  if (!isLoggedIn) {
    return (
      <div>
        <h2 className="text-base font-bold text-brand-900">Apply for this role</h2>
        <p className="mt-2 text-sm text-slate-600">
          Sign in or create a candidate account to apply. You&apos;ll need a CV
          ready to upload.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <ButtonLink href="/login" variant="primary" className="w-full">
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Sign in to apply
          </ButtonLink>
          <ButtonLink href="/register/candidate" variant="outline" className="w-full">
            Create a candidate account
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (!isCandidate) {
    return (
      <Alert tone="info" title="Candidate account required">
        You are signed in with an employer or staff account. Applications must be
        submitted from a candidate account.
      </Alert>
    );
  }

  if (!hasResume) {
    return (
      <div>
        <h2 className="text-base font-bold text-brand-900">Add your CV to apply</h2>
        <p className="mt-2 text-sm text-slate-600">
          A CV is required for each application. Upload a PDF, DOC or DOCX file to
          your profile, then return to apply.
        </p>
        <ButtonLink href="/candidate/profile" variant="primary" className="mt-4 w-full">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Upload CV
        </ButtonLink>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate>
      <h2 className="text-base font-bold text-brand-900">Apply for this role</h2>
      <p className="mt-1.5 text-sm text-slate-600">
        Your profile CV will be attached to this application.
      </p>

      {state?.ok === false && (
        <div className="mt-4">
          <Alert tone="error" title="Could not submit application">
            {state.message}
          </Alert>
        </div>
      )}

      <input type="hidden" name="jobId" value={jobId} />

      <Field className="mt-4">
        <Label htmlFor="contactEmail" required>
          Contact email
        </Label>
        <Input
          id="contactEmail"
          name="contactEmail"
          type="email"
          defaultValue={defaultEmail}
          required
          invalid={Boolean(errors.contactEmail)}
        />
        <FieldError id="contactEmail-error" message={errors.contactEmail} />
      </Field>

      <Field>
        <Label htmlFor="contactPhone" required>
          Contact phone
        </Label>
        <Input
          id="contactPhone"
          name="contactPhone"
          type="tel"
          defaultValue={defaultPhone}
          required
          invalid={Boolean(errors.contactPhone)}
        />
        <FieldError id="contactPhone-error" message={errors.contactPhone} />
      </Field>

      <Field>
        <Label htmlFor="coverLetter">Cover letter (optional)</Label>
        <Textarea
          id="coverLetter"
          name="coverLetter"
          rows={5}
          placeholder="Briefly outline why you are a good fit for this role."
        />
        <FieldError id="coverLetter-error" message={errors.coverLetter} />
      </Field>

      <label className="flex items-start gap-2.5 text-sm text-slate-700">
        <Checkbox name="consent" required aria-describedby="consent-error" />
        <span>
          I confirm the information provided is accurate and consent to it being
          shared with the hiring organisation for recruitment purposes.
        </span>
      </label>
      <FieldError id="consent-error" message={errors.consent} />

      <SubmitButton pendingText="Submitting…" className="mt-5 w-full" size="lg">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        Submit application
      </SubmitButton>
    </form>
  );
}
