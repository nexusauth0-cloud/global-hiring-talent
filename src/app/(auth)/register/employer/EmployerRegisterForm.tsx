"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerEmployerAction } from "@/server/actions/auth";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  Checkbox,
  Field,
  FieldError,
  Hint,
  Input,
  Label,
} from "@/components/ui/Field";

export function EmployerRegisterForm() {
  const [state, formAction] = useActionState(registerEmployerAction, undefined);
  const errors = state?.ok === false ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} noValidate>
      <h1 className="text-2xl font-extrabold text-brand-900">
        Register your organisation
      </h1>
      <p className="mt-1.5 text-sm text-slate-600">
        Create an employer account to manage hiring requests and job postings.
      </p>

      <div className="mt-5">
        <Alert tone="info">
          Employer accounts are reviewed before jobs can be published, to keep the
          job board genuine. You can set up your profile straight away.
        </Alert>
      </div>

      {state?.ok === false && (
        <div className="mt-5">
          <Alert tone="error" title="We couldn't create your account">
            {state.message}
          </Alert>
        </div>
      )}

      <div className="mt-6">
        <Field>
          <Label htmlFor="organizationName" required>
            Organisation name
          </Label>
          <Input
            id="organizationName"
            name="organizationName"
            autoComplete="organization"
            required
            invalid={Boolean(errors.organizationName)}
          />
          <FieldError id="org-error" message={errors.organizationName} />
        </Field>

        <Field>
          <Label htmlFor="contactName" required>
            Your name
          </Label>
          <Input
            id="contactName"
            name="contactName"
            autoComplete="name"
            required
            invalid={Boolean(errors.contactName)}
          />
          <FieldError id="contactName-error" message={errors.contactName} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field className="mb-0">
            <Label htmlFor="email" required>
              Work email
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
          <Field className="mb-0">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" />
          </Field>
        </div>
      </div>

      <div className="mt-4">
        <Field>
          <Label htmlFor="password" required>
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            invalid={Boolean(errors.password)}
          />
          {errors.password ? (
            <FieldError id="password-error" message={errors.password} />
          ) : (
            <Hint id="password-hint">
              At least 10 characters, including letters and numbers.
            </Hint>
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field className="mb-0">
            <Label htmlFor="website">Website (optional)</Label>
            <Input id="website" name="website" type="url" placeholder="https://" />
            <FieldError id="website-error" message={errors.website} />
          </Field>
          <Field className="mb-0">
            <Label htmlFor="industry">Industry (optional)</Label>
            <Input id="industry" name="industry" />
          </Field>
        </div>
      </div>

      <Field className="mt-4">
        <label className="flex items-start gap-2.5 text-sm text-slate-700">
          <Checkbox name="acceptTerms" required aria-describedby="terms-error" />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="font-medium text-brand-700 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-brand-700 hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        <FieldError id="terms-error" message={errors.acceptTerms} />
      </Field>

      <SubmitButton pendingText="Creating account…" className="w-full" size="lg">
        Create employer account
      </SubmitButton>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Sign in
        </Link>
        .
      </p>
    </form>
  );
}
