import type { z } from 'zod'

import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'

export const CONTEXTUAL_COUNT_IN_LAIR_MUST_EXCEED_NORMAL_MESSAGE =
  'In-lair uses must be greater than normal uses.' as const

type ContextualUses = { normal?: number; inLair?: number }

/** Publish guard: optional in-lair totals must exceed normal totals. */
export function refineContextualCountInLairExceedsNormal(
  uses: ContextualUses | undefined,
  ctx: z.RefinementCtx,
  inLairPath: (string | number)[],
): void {
  if (uses?.normal === undefined || uses.inLair === undefined) return
  if (uses.inLair <= uses.normal) {
    addCustomRefinementIssue(ctx, CONTEXTUAL_COUNT_IN_LAIR_MUST_EXCEED_NORMAL_MESSAGE, inLairPath)
  }
}
