"use client";

import { useActionState } from "react";
import { createHiringRequestAction } from "@/server/actions/employer";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  Field,
  FieldError,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui/Field";

export function HiringRequestForm() {
  const [state, formAction] = useActionState(createHiringRequestAction, undefined);
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
        <Label htmlFor="title" required>
          Role title
        </Label>
        <Input
          id="title"
          name="title"
          required
          invalid={Boolean(errors.title)}
          placeholder="e.g. Site Reliability Engineer"
        />
        <FieldError id="title-error" message={errors.title} />
      </Field>

      <Field>
        <Label htmlFor="description" required>
          Requirement details
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={6}
          required
          invalid={Boolean(errors.description)}
          placeholder="Describe the role, must-have skills, team context and timeline."
        />
        <FieldError id="description-error" message={errors.description} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field className="mb-0">
          <Label htmlFor="rolesNeeded" required>
            Number of roles
          </Label>
          <Input
            id="rolesNeeded"
            name="rolesNeeded"
            type="number"
            min={1}
            max={5000}
            defaultValue={1}
            required
            invalid={Boolean(errors.rolesNeeded)}
          />
          <FieldError id="rolesNeeded-error" message={errors.rolesNeeded} />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="employmentType" required>
            Employment type
          </Label>
          <Select id="employmentType" name="employmentType" defaultValue="onsite" required>
            <option value="onsite">On-site</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
          </Select>
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field className="mb-0">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field className="mb-0">
          <Label htmlFor="industry">Industry</Label>
          <Input id="industry" name="industry" />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="urgency" required>
            Urgency
          </Label>
          <Select id="urgency" name="urgency" defaultValue="medium" required>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </Select>
          {errors.urgency && <FieldError id="urgency-error" message={errors.urgency} />}
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field className="mb-0">
          <Label htmlFor="budgetMin">Budget min</Label>
          <Input id="budgetMin" name="budgetMin" type="number" min={0} />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="budgetMax">Budget max</Label>
          <Input id="budgetMax" name="budgetMax" type="number" min={0} />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" name="currency" maxLength={8} defaultValue="USD" />
        </Field>
      </div>

      <SubmitButton pendingText="Submitting…" className="mt-5">
        Submit request
      </SubmitButton>
    </form>
  );
}
