"use client";

import { useActionState } from "react";
import {
  createJobAction,
  updateJobAction,
} from "@/server/actions/employer";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  Field,
  FieldError,
  Hint,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui/Field";

type JobDefaults = {
  title: string;
  summary: string;
  description: string;
  responsibilities: string;
  requirements: string;
  employmentType: string;
  location: string;
  country: string;
  department: string;
  industry: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  skills: string;
  applicationDeadline: string;
  status: string;
};

export function JobForm({
  mode,
  jobId,
  defaults,
}: {
  mode: "create" | "edit";
  jobId?: string;
  defaults: JobDefaults;
}) {
  const action = mode === "create" ? createJobAction : updateJobAction;
  const [state, formAction] = useActionState(action, undefined);
  const errors = state?.ok === false ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} noValidate>
      {jobId && <input type="hidden" name="jobId" value={jobId} />}
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
          Job title
        </Label>
        <Input
          id="title"
          name="title"
          defaultValue={defaults.title}
          required
          invalid={Boolean(errors.title)}
        />
        <FieldError id="title-error" message={errors.title} />
      </Field>

      <Field>
        <Label htmlFor="summary">Short summary</Label>
        <Textarea
          id="summary"
          name="summary"
          rows={2}
          maxLength={400}
          defaultValue={defaults.summary}
          placeholder="One or two sentences shown in job listings."
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field className="mb-0">
          <Label htmlFor="employmentType" required>
            Employment type
          </Label>
          <Select
            id="employmentType"
            name="employmentType"
            defaultValue={defaults.employmentType}
            required
          >
            <option value="onsite">On-site</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
          </Select>
        </Field>
        <Field className="mb-0">
          <Label htmlFor="status" required>
            Status
          </Label>
          <Select id="status" name="status" defaultValue={defaults.status} required>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </Select>
          {errors.status && (
            <FieldError id="status-error" message={errors.status} />
          )}
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field className="mb-0">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={defaults.location} />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={defaults.country} />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field className="mb-0">
          <Label htmlFor="department">Department</Label>
          <Input id="department" name="department" defaultValue={defaults.department} />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="industry">Industry</Label>
          <Input id="industry" name="industry" defaultValue={defaults.industry} />
        </Field>
      </div>

      <Field className="mt-4">
        <Label htmlFor="description" required>
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={7}
          defaultValue={defaults.description}
          required
          invalid={Boolean(errors.description)}
          placeholder="Describe the role, the team and day-to-day responsibilities."
        />
        <FieldError id="description-error" message={errors.description} />
      </Field>

      <Field>
        <Label htmlFor="responsibilities">Responsibilities</Label>
        <Textarea
          id="responsibilities"
          name="responsibilities"
          rows={5}
          defaultValue={defaults.responsibilities}
          placeholder="One per line."
        />
      </Field>

      <Field>
        <Label htmlFor="requirements">Requirements</Label>
        <Textarea
          id="requirements"
          name="requirements"
          rows={5}
          defaultValue={defaults.requirements}
          placeholder="Qualifications, experience and skills required."
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field className="mb-0">
          <Label htmlFor="salaryMin">Salary min</Label>
          <Input
            id="salaryMin"
            name="salaryMin"
            type="number"
            min={0}
            defaultValue={defaults.salaryMin}
          />
          <FieldError id="salaryMin-error" message={errors.salaryMin} />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="salaryMax">Salary max</Label>
          <Input
            id="salaryMax"
            name="salaryMax"
            type="number"
            min={0}
            defaultValue={defaults.salaryMax}
          />
          <FieldError id="salaryMax-error" message={errors.salaryMax} />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            name="currency"
            maxLength={8}
            defaultValue={defaults.currency}
            placeholder="USD"
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field>
          <Label htmlFor="skills">Skills</Label>
          <Input
            id="skills"
            name="skills"
            defaultValue={defaults.skills}
            placeholder="Comma separated, e.g. AutoCAD, Lean Manufacturing"
          />
          <Hint id="skills-hint">Separate each skill with a comma.</Hint>
        </Field>
        <Field>
          <Label htmlFor="applicationDeadline">Application deadline</Label>
          <Input
            id="applicationDeadline"
            name="applicationDeadline"
            type="date"
            defaultValue={defaults.applicationDeadline}
          />
          <FieldError id="applicationDeadline-error" message={errors.applicationDeadline} />
        </Field>
      </div>

      <SubmitButton pendingText="Saving…" className="mt-5">
        {mode === "create" ? "Create job" : "Save changes"}
      </SubmitButton>
    </form>
  );
}
