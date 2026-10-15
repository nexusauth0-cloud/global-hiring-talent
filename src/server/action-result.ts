import "server-only";

export type FieldErrors = Record<string, string>;

export type ActionResult<T = undefined> =
  | ({ ok: true; message: string } & (T extends undefined ? object : { data: T }))
  | { ok: false; message: string; fieldErrors?: FieldErrors; code?: string };

export function ok<T = undefined>(
  message: string,
  data?: T
): ActionResult<T> {
  return (
    data === undefined ? { ok: true, message } : { ok: true, message, data }
  ) as ActionResult<T>;
}

export function fail(
  message: string,
  fieldErrors?: FieldErrors,
  code?: string
): ActionResult<never> {
  return { ok: false, message, fieldErrors, code };
}
