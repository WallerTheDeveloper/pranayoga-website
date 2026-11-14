export type SubmitResult = { ok: true } | { ok: false }

/** Sends a validated form. Phase 3 keeps the forms UI only (docs/PLAN.md), so nothing leaves. */
export type FormSubmitter<T> = (values: T) => Promise<SubmitResult>

/** A short pause, so the "Wird gesendet …" state is real; replaced by sending before launch. */
export const STUB_SEND_MS = 600

export function stubSubmit<T>(values: T): Promise<SubmitResult> {
  void values
  return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), STUB_SEND_MS))
}
