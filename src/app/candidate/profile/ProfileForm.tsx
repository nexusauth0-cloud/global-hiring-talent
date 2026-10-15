"use client";

import { useActionState } from "react";
import { updateCandidateProfileAction } from "@/server/actions/candidate";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Field, FieldError, Hint, Input, Label, Textarea } from "@/components/ui/Field";

export function ProfileForm({
  defaults,
}: {
  defaults: {
    firstName: string;
    lastName: string;
    phone: string;
    headline: string;
    summary: string;
    location: string;
    country: string;
    linkedinUrl: string;
    skills: string;
  };
}) {
  const [state, formAction] = useActionState(updateCandidateProfileAction, undefined);
  const errors = state?.ok === false ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} noValidate>
      {state?.ok && (
        <div className="mb-5">
          <Alert tone="success">{state.message}</Alert>
        </div>
      )}
      {state?.ok === false && (
        <div className="mb-5">
          <Alert tone="error" title="Could not save">
            {state.message}
          </Alert>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field className="mb-0">
          <Label htmlFor="firstName" required>
            First name
          </Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={defaults.firstName}
            required
            invalid={Boolean(errors.firstName)}
          />
          <FieldError id="firstName-error" message={errors.firstName} />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="lastName" required>
            Last name
          </Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={defaults.lastName}
            required
            invalid={Boolean(errors.lastName)}
          />
          <FieldError id="lastName-error" message={errors.lastName} />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field className="mb-0">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={defaults.phone} />
          <FieldError id="phone-error" message={errors.phone} />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={defaults.location} />
        </Field>
      </div>

      <div className="mt-4">
        <Field>
          <Label htmlFor="headline">Professional headline</Label>
          <Input
            id="headline"
            name="headline"
            defaultValue={defaults.headline}
            placeholder="e.g. Senior Mechanical Engineer"
          />
        </Field>

        <Field>
          <Label htmlFor="summary">Professional summary</Label>
          <Textarea id="summary" name="summary" rows={5} defaultValue={defaults.summary} />
        </Field>

        <Field>
          <Label htmlFor="skills">Skills</Label>
          <Input
            id="skills"
            name="skills"
            defaultValue={defaults.skills}
            placeholder="Comma separated, e.g. AutoCAD, Project Management"
          />
          <Hint id="skills-hint">Separate each skill with a comma.</Hint>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field className="mb-0">
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" defaultValue={defaults.country} />
          </Field>
          <Field className="mb-0">
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              placeholder="https://"
              defaultValue={defaults.linkedinUrl}
            />
            <FieldError id="linkedin-error" message={errors.linkedinUrl} />
          </Field>
        </div>
      </div>

      <SubmitButton pendingText="Saving…" className="mt-5">
        Save profile
      </SubmitButton>
    </form>
  );
}
