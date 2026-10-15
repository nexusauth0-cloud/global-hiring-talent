"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerCandidateAction } from "@/server/actions/auth";
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

export function CandidateRegisterForm() {
  const [state, formAction] = useActionState(registerCandidateAction, undefined);
  const errors = state?.ok === false ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} noValidate>
      <h1 className="text-2xl font-extrabold text-brand-900">
        Create your candidate account
      </h1>
      <p className="mt-1.5 text-sm text-slate-600">
        Apply to jobs, upload your CV and track your applications.
      </p>

      {state?.ok === false && (
        <div className="mt-5">
          <Alert tone="error" title="We couldn't create your account">
            {state.message}
          </Alert>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field className="mb-0">
          <Label htmlFor="firstName" required>
            First name
          </Label>
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
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
            autoComplete="family-name"
            required
            invalid={Boolean(errors.lastName)}
          />
          <FieldError id="lastName-error" message={errors.lastName} />
        </Field>
      </div>

      <div className="mt-4">
        <Field>
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
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" />
            <FieldError id="phone-error" message={errors.phone} />
          </Field>
          <Field className="mb-0">
            <Label htmlFor="country">Country (optional)</Label>
            <Input id="country" name="country" autoComplete="country-name" />
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
        Create account
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
