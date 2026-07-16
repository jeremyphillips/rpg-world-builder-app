import type { ModelingBlocker, ModelingGapEntry } from './gap-entry'
import type { ContentModeling } from './schema'
import type { ExplicitModelingStatus, ModelingStatus } from './status'
import { meetsModelingThreshold } from './status'

/** Next explicit status rung blocked when a promotion blocker is present. */
export function deriveBlockedFrom(
  effectiveStatus: ModelingStatus,
  blocker: ModelingBlocker | undefined,
): ExplicitModelingStatus | undefined {
  if (!blocker) return undefined

  if (effectiveStatus === 'prose-only' || effectiveStatus === 'non-meaningful-partial') {
    return 'meaningful-partial'
  }

  if (effectiveStatus === 'meaningful-partial') {
    return 'sufficient-for-display'
  }

  if (effectiveStatus === 'sufficient-for-display') {
    return 'sufficient-for-character-sheet'
  }

  if (effectiveStatus === 'sufficient-for-character-sheet') {
    return 'mechanics-ready'
  }

  return undefined
}

/** Blocker plus residual gaps for full inventory views. */
export function allModelingLimitations(modeling: ContentModeling): ModelingGapEntry[] {
  const limitations: ModelingGapEntry[] = []
  if (modeling.blocker) {
    limitations.push(modeling.blocker)
  }
  if (modeling.gaps) {
    limitations.push(...modeling.gaps)
  }
  return limitations
}

export function hasDocumentedPromotionBlocker(
  modeling: ContentModeling | undefined | null,
): boolean {
  return modeling?.blocker !== undefined
}

export function meetsBlockedFromThreshold(
  effectiveStatus: ModelingStatus,
  blockedFrom: ExplicitModelingStatus | undefined,
  threshold: ExplicitModelingStatus,
): boolean {
  if (!blockedFrom) return false
  return (
    meetsModelingThreshold(blockedFrom, threshold) &&
    !meetsModelingThreshold(effectiveStatus, threshold)
  )
}
