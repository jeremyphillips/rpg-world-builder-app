import {
  CONTENT_VISIBILITY_MODE_ENTRIES,
  resolveContentCampaignAccess,
  type ContentVisibilityMode,
  type ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import type { FieldOptionAvailability } from '@rpg/ui/form'

const VISIBILITY_RESTRICTIVENESS: Record<ContentVisibilityMode, number> = {
  all_players: 0,
  specific_players: 1,
  dm_only: 2,
}

/** Visibility modes the parent allows for new child edits (UI constraint only). */
export function allowedChildVisibilityModes(
  parent: ResolvedContentCampaignAccess,
): ContentVisibilityMode[] {
  if (!parent.available) return []

  const parentRank = VISIBILITY_RESTRICTIVENESS[parent.visibilityMode]
  return (Object.keys(VISIBILITY_RESTRICTIVENESS) as ContentVisibilityMode[]).filter(
    (mode) => VISIBILITY_RESTRICTIVENESS[mode] >= parentRank,
  )
}

export function isChildVisibilityModeAllowed(
  parent: ResolvedContentCampaignAccess,
  mode: ContentVisibilityMode,
): boolean {
  return allowedChildVisibilityModes(parent).includes(mode)
}

/** Disables visibility options that would broaden beyond the parent on new edits. */
export function parentNarrowedVisibilityOptionAvailability(
  parent: ResolvedContentCampaignAccess,
): FieldOptionAvailability {
  const allowed = new Set(allowedChildVisibilityModes(parent))

  return {
    dependsOn: ['available'],
    enabledWhen: (values, optionValue) =>
      Boolean(values.available) && allowed.has(optionValue as ContentVisibilityMode),
  }
}

/** Participant ids the parent permits for new child selections. */
export function allowedChildParticipantIds(
  parent: ResolvedContentCampaignAccess,
): readonly string[] | undefined {
  if (!parent.available) return []
  if (parent.visibilityMode !== 'specific_players') return undefined
  return parent.participantIds
}

export function resolveParentCampaignAccessSummary(parent: ResolvedContentCampaignAccess): string {
  const resolved = resolveContentCampaignAccess(parent)
  if (!resolved.available) return 'Unavailable'

  if (resolved.visibilityMode === 'specific_players') {
    const count = resolved.participantIds.length
    return count === 1 ? '1 specific player' : `${count} specific players`
  }

  return CONTENT_VISIBILITY_MODE_ENTRIES[resolved.visibilityMode].label
}
