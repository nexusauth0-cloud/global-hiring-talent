"use client";

import { useActionState } from "react";
import { saveArticleAction } from "@/server/actions/admin";
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

export function ArticleForm({
  articleId,
  defaults,
}: {
  articleId?: string;
  defaults: {
    title: string;
    excerpt: string;
    body: string;
    category: string;
    coverImage: string;
    authorName: string;
    status: string;
  };
}) {
  const [state, formAction] = useActionState(saveArticleAction, undefined);
  const errors = state?.ok === false ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} noValidate>
      {articleId && <input type="hidden" name="articleId" value={articleId} />}
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
          Title
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Field className="mb-0">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={defaults.category} />
        </Field>
        <Field className="mb-0">
          <Label htmlFor="status" required>
            Status
          </Label>
          <Select id="status" name="status" defaultValue={defaults.status} required>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
        </Field>
      </div>

      <Field className="mt-4">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" name="excerpt" rows={2} maxLength={400} defaultValue={defaults.excerpt} />
      </Field>

      <Field>
        <Label htmlFor="coverImage">Cover image path</Label>
        <Input
          id="coverImage"
          name="coverImage"
          defaultValue={defaults.coverImage}
          placeholder="Path to a file under /public (leave empty for none)"
        />
        <Hint id="coverImage-hint">
          Path to an image under /public. Leave empty for no cover.
        </Hint>
      </Field>

      <Field>
        <Label htmlFor="authorName">Author</Label>
        <Input id="authorName" name="authorName" defaultValue={defaults.authorName} />
      </Field>

      <Field>
        <Label htmlFor="body" required>
          Body
        </Label>
        <Textarea
          id="body"
          name="body"
          rows={16}
          defaultValue={defaults.body}
          required
          invalid={Boolean(errors.body)}
          placeholder="Write the article. Separate paragraphs with a blank line."
        />
        <FieldError id="body-error" message={errors.body} />
      </Field>

      <SubmitButton pendingText="Saving…" className="mt-5">
        {articleId ? "Save changes" : "Create article"}
      </SubmitButton>
    </form>
  );
}
