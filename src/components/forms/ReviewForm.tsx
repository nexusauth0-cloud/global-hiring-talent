"use client";

import { useActionState } from "react";
import { submitReviewAction } from "@/server/actions/reviews";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { StarInput } from "@/components/reviews/StarRating";
import {
  Checkbox,
  Field,
  FieldError,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui/Field";

export function ReviewForm() {
  const [state, formAction] = useActionState(submitReviewAction, undefined);
  const errors = state?.ok === false ? state.fieldErrors ?? {} : {};

  if (state?.ok) {
    return (
      <Alert tone="success" title="Review submitted">
        {state.message}
      </Alert>
    );
  }

  return (
    <form action={formAction} noValidate>
      {state?.ok === false && (
        <div className="mb-5">
          <Alert tone="error" title="Could not submit review">
            {state.message}
          </Alert>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field className="mb-0">
          <Label htmlFor="authorName" required>
            Your name
          </Label>
          <Input
            id="authorName"
            name="authorName"
            required
            invalid={Boolean(errors.authorName)}
          />
          <FieldError id="authorName-error" message={errors.authorName} />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="authorEmail" required>
            Your email (not published)
          </Label>
          <Input
            id="authorEmail"
            name="authorEmail"
            type="email"
            required
            invalid={Boolean(errors.authorEmail)}
          />
          <FieldError id="authorEmail-error" message={errors.authorEmail} />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field className="mb-0">
          <StarInput name="rating" />
          <FieldError id="rating-error" message={errors.rating} />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="category" required>
            What is your review about?
          </Label>
          <Select id="category" name="category" required defaultValue="candidate">
            <option value="candidate">My experience as a candidate</option>
            <option value="employer">My experience as an employer</option>
            <option value="service">The quality of service</option>
          </Select>
          <FieldError id="category-error" message={errors.category} />
        </Field>
      </div>

      <Field className="mt-4">
        <Label htmlFor="body" required>
          Your review
        </Label>
        <Textarea
          id="body"
          name="body"
          rows={6}
          required
          invalid={Boolean(errors.body)}
          placeholder="Describe your genuine experience. Please avoid naming individuals."
        />
        <FieldError id="body-error" message={errors.body} />
      </Field>

      <label className="flex items-start gap-2.5 text-sm text-slate-700">
        <Checkbox name="consent" required aria-describedby="consent-error" />
        <span>
          I confirm this review reflects my own genuine experience. I understand
          it will be moderated before publication.
        </span>
      </label>
      <FieldError id="consent-error" message={errors.consent} />

      <SubmitButton pendingText="Submitting…" className="mt-5" size="lg">
        Submit review
      </SubmitButton>
    </form>
  );
}
