import { getMagicItemRarityLabel } from '../../../../vocab/magic-item/rarity'
import type { CharacterBuildContext } from '../../context'
import { indexCharacterBuildCatalog } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import type { MagicItemGrantReadiness } from '../../equipment/magic-item-selection'
import { resolveMagicItemGrantReadiness } from './resolve-magic-item-grant-progress'
import { resolveMagicItemAcquisitionState } from './resolve-magic-item-acquisition-state'

export const MAGIC_ITEM_GRANT_INCOMPLETE_ISSUE_CODE_PREFIX = 'magic_item_grant_incomplete' as const

export function magicItemGrantIncompleteIssueCode(allowanceId: string): string {
  return `${MAGIC_ITEM_GRANT_INCOMPLETE_ISSUE_CODE_PREFIX}:${allowanceId}`
}

export function isMagicItemGrantIncompleteIssueCode(code: string): boolean {
  return code.startsWith(`${MAGIC_ITEM_GRANT_INCOMPLETE_ISSUE_CODE_PREFIX}:`)
}

export function readMagicItemGrantIncompleteAllowanceId(code: string): string | undefined {
  if (!isMagicItemGrantIncompleteIssueCode(code)) return undefined
  return code.slice(MAGIC_ITEM_GRANT_INCOMPLETE_ISSUE_CODE_PREFIX.length + 1)
}

export function resolveUnresolvedMagicItemGrantIssues(args: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
}): MagicItemGrantReadiness['issues'] {
  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const acquisition = resolveMagicItemAcquisitionState({
    draft: args.draft,
    context: args.context,
    catalogIndex,
  })

  if (acquisition.allowances.length === 0) return []

  const readiness = resolveMagicItemGrantReadiness({
    allowances: acquisition.allowances,
    progress: acquisition.progress,
  })

  return readiness.issues
}

export function formatMagicItemGrantIncompleteLabel(
  rarity: MagicItemGrantReadiness['issues'][number]['rarity'],
): string {
  return getMagicItemRarityLabel(rarity)
}

export function resolveMagicItemGrantReviewProgress(args: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  allowanceId: string
}): { current: number; total: number } | undefined {
  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const acquisition = resolveMagicItemAcquisitionState({
    draft: args.draft,
    context: args.context,
    catalogIndex,
  })

  const allowance = acquisition.allowances.find((entry) => entry.id === args.allowanceId)
  if (!allowance) return undefined

  const progress = acquisition.progress.find((entry) => entry.allowanceId === args.allowanceId)

  return {
    current: progress?.selected ?? 0,
    total: allowance.count,
  }
}
