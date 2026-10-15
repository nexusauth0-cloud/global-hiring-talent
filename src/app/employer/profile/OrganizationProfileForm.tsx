"use client";

import { useActionState } from "react";
import { updateOrganizationProfileAction } from "@/server/actions/employer";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  Field,
  FieldError,
  Input,
  Label,
  Textarea,
} from "@/components/ui/Field";

export function OrganizationProfileForm({
  defaults,
}: {
  defaults: {
    name: string;
    website: string;
    industry: string;
    companySize: string;
    description: string;
    country: string;
    city: string;
    contactEmail: string;
    contactPhone: string;
  };
}) {
  const [state, formAction] = useActionState(updateOrganizationProfileAction, undefined);
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
          <Alert tone="error">{state.message}</Alert>
        </div>
      )}

      <Field>
        <Label htmlFor="name" required>
          Company name
        </Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaults.name}
          required
          invalid={Boolean(errors.name)}
        />
        <FieldError id="name-error" message={errors.name} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field className="mb-0">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            type="url"
            placeholder="https://"
            defaultValue={defaults.website}
          />
          <FieldError id="website-error" message={errors.website} />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="industry">Industry</Label>
          <Input id="industry" name="industry" defaultValue={defaults.industry} />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field className="mb-0">
          <Label htmlFor="companySize">Company size</Label>
          <Input
            id="companySize"
            name="companySize"
            placeholder="e.g. 51-200"
            defaultValue={defaults.companySize}
          />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={defaults.contactEmail}
          />
          <FieldError id="contactEmail-error" message={errors.contactEmail} />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field className="mb-0">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={defaults.country} />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={defaults.city} />
        </Field>
      </div>

      <div className="mt-4">
        <Field>
          <Label htmlFor="contactPhone">Contact phone</Label>
          <Input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            defaultValue={defaults.contactPhone}
          />
          <FieldError id="contactPhone-error" message={errors.contactPhone} />
        </Field>
        <Field>
          <Label htmlFor="description">About the company</Label>
          <Textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={defaults.description}
          />
        </Field>
      </div>

      <SubmitButton pendingText="Saving…" className="mt-5">
        Save company profile
      </SubmitButton>
    </form>
  );
}
