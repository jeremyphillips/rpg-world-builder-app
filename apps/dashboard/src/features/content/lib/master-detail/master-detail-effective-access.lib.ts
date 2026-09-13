import {
  resolveContentCampaignAccess,
  resolveEffectiveCampaignAccess,
  type ContentCampaignAccess,
  type ResolvedContentCampaignAccess,
} from '@rpg/contracts'

import { resolveParentCampaignAccessSummary } from '../campaign-access/campaign-access-parent-narrowing.lib'

export function readRowLocalCampaignAccess(
  row: unknown,
  fieldName: string,
): ResolvedContentCampaignAccess {
  if (typeof row !== 'object' || row === null) {
    return resolveContentCampaignAccess(undefined)
  }

  const stored = (row as Record<string, unknown>)[fieldName] as
    | Partial<ContentCampaignAccess>
    | undefined

  return resolveContentCampaignAccess(stored)
}

export function resolveMasterDetailInheritedRestrictionHint(
  parentAccess: ResolvedContentCampaignAccess,
  localAccess: ResolvedContentCampaignAccess,
): string | undefined {
  if (!parentAccess.available) {
    return 'This species is unavailable in the campaign. Options remain editable locally but are effectively unavailable to players.'
  }

  const effective = resolveEffectiveCampaignAccess(parentAccess, {
    available: localAccess.available,
    visibilityMode: localAccess.visibilityMode,
    participantIds: localAccess.participantIds,
  })

  if (
    localAccess.available &&
    effective.available &&
    (effective.visibilityMode !== localAccess.visibilityMode ||
      effective.participantIds.join(',') !== localAccess.participantIds.join(','))
  ) {
    return `Species player access narrows this option to ${resolveParentCampaignAccessSummary(parentAccess)} at runtime.`
  }

  return undefined
}
