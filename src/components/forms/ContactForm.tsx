"use client";

import { useActionState } from "react";
import { submitContactAction } from "@/server/actions/contact";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  Checkbox,
  Field,
  FieldError,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui/Field";

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactAction, undefined);
  const errors = state?.ok === false ? state.fieldErrors ?? {} : {};

  if (state?.ok) {
    return (
      <Alert tone="success" title="Enquiry received">
        {state.message}
      </Alert>
    );
  }

  return (
    <form action={formAction} noValidate>
      {state?.ok === false && (
        <div className="mb-5">
          <Alert tone="error" title="Could not send your enquiry">
            {state.message}
          </Alert>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field className="mb-0">
          <Label htmlFor="name" required>
            Your name
          </Label>
          <Input id="name" name="name" autoComplete="name" required invalid={Boolean(errors.name)} />
          <FieldError id="name-error" message={errors.name} />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="email" required>
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            invalid={Boolean(errors.email)}
          />
          <FieldError id="email-error" message={errors.email} />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field className="mb-0">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="company">Company (optional)</Label>
          <Input id="company" name="company" autoComplete="organization" />
        </Field>
      </div>

      <Field className="mt-4">
        <Label htmlFor="interest" required>
          I am contacting as
        </Label>
        <Select id="interest" name="interest" required defaultValue="employer">
          <option value="employer">An employer or hiring team</option>
          <option value="candidate">A candidate or job seeker</option>
          <option value="other">Something else</option>
        </Select>
        <FieldError id="interest-error" message={errors.interest} />
      </Field>

      <Field>
        <Label htmlFor="message" required>
          How can we help?
        </Label>
        <Textarea
          id="message"
          name="message"
          rows={6}
          required
          invalid={Boolean(errors.message)}
          placeholder="Tell us about your requirement or question."
        />
        <FieldError id="message-error" message={errors.message} />
      </Field>

      <label className="flex items-start gap-2.5 text-sm text-slate-700">
        <Checkbox name="consent" required aria-describedby="consent-error" />
        <span>
          I consent to {`Global Hiring Talent`} storing and using my details to
          respond to this enquiry, in line with the Privacy Policy.
        </span>
      </label>
      <FieldError id="consent-error" message={errors.consent} />

      <SubmitButton pendingText="Sending…" className="mt-5 w-full sm:w-auto" size="lg">
        Send enquiry
      </SubmitButton>
    </form>
  );
}
