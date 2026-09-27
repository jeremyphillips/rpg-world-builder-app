import type { z, ZodIssue } from 'zod'

/** Builds a custom {@link ZodIssue} for manual issue collection (path required). */
export function customZodIssue(message: string, path: PropertyKey[]): ZodIssue {
  return { code: 'custom', message, path }
}

export type CustomRefinementIssueContext = Pick<z.RefinementCtx, 'addIssue'>

/** Registers a custom refinement issue on `ctx` (Zod 4 — `"custom"`, not `ZodIssueCode`). */
export function addCustomRefinementIssue(
  ctx: CustomRefinementIssueContext,
  message: string,
  path?: PropertyKey[],
): void {
  if (path) {
    ctx.addIssue({ code: 'custom', message, path })
  } else {
    ctx.addIssue({ code: 'custom', message })
  }
}
