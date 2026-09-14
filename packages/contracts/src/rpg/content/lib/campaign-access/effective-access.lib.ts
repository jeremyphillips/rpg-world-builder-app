import type { ContentViewer } from '../../../campaign/campaign-content-viewer'
import type { ContentVisibilityMode } from '../../../vocab/content-visibility'
import { isContentDiscoverableForViewer } from '../../../runtime/campaign/content-viewer-discovery'

import { isBodyRowAvailable } from './body-row-availability'
import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  resolveContentCampaignAccess,
  type ContentCampaignAccess,
  type ResolvedContentCampaignAccess,
} from './campaign-access'

const VISIBILITY_RESTRICTIVENESS: Record<ContentVisibilityMode, number> = {
  all_players: 0,
  specific_players: 1,
  dm_only: 2,
}

function intersectVisibilityModes(
  parent: ContentVisibilityMode,
  child: ContentVisibilityMode,
): ContentVisibilityMode {
  return VISIBILITY_RESTRICTIVENESS[parent] >= VISIBILITY_RESTRICTIVENESS[child] ? parent : child
}

function intersectParticipantIds(
  parent: ResolvedContentCampaignAccess,
  child: ResolvedContentCampaignAccess,
  effectiveMode: ContentVisibilityMode,
): string[] {
  if (effectiveMode !== 'specific_players') return []

  const parentIds = parent.visibilityMode === 'specific_players' ? parent.participantIds : undefined
  const childIds = child.visibilityMode === 'specific_players' ? child.participantIds : undefined

  if (parentIds && childIds) {
    const childSet = new Set(childIds)
    return parentIds.filter((id) => childSet.has(id))
  }

  if (parentIds) return [...parentIds]
  if (childIds) return [...childIds]
  return []
}

function unavailableEffectiveAccess(
  base: ResolvedContentCampaignAccess,
): ResolvedContentCampaignAccess {
  return {
    ...base,
    available: false,
    effectiveAudience: 'none',
  }
}

/** Viewer-agnostic: parent ∩ child. Stored child may be broader than parent. */
export function resolveEffectiveCampaignAccess(
  parent: ResolvedContentCampaignAccess,
  child: Partial<ContentCampaignAccess> | undefined,
): ResolvedContentCampaignAccess {
  const resolvedChild = resolveContentCampaignAccess(child)

  if (!parent.available || !resolvedChild.available) {
    return unavailableEffectiveAccess(parent)
  }

  const visibilityMode = intersectVisibilityModes(
    parent.visibilityMode,
    resolvedChild.visibilityMode,
  )
  const participantIds = intersectParticipantIds(parent, resolvedChild, visibilityMode)
  const unavailableParticipantIds = [
    ...new Set([...parent.unavailableParticipantIds, ...resolvedChild.unavailableParticipantIds]),
  ]

  return {
    available: true,
    visibilityMode,
    participantIds,
    unavailableParticipantIds,
    effectiveAudience: visibilityMode,
  }
}

export function isEffectiveAvailable(access: ResolvedContentCampaignAccess): boolean {
  return access.available !== false && access.effectiveAudience !== 'none'
}

/** Separate viewer pass — do not combine into resolveEffective* signatures. */
export function isVisibleToViewer(
  access: ResolvedContentCampaignAccess,
  viewer: ContentViewer,
): boolean {
  return isContentDiscoverableForViewer(access, viewer)
}

/** Species trait: species access ∩ body available boolean (no row-level visibility). */
export function resolveEffectiveSpeciesTraitAccess(
  speciesAccess: ResolvedContentCampaignAccess,
  trait: { available?: boolean },
): ResolvedContentCampaignAccess {
  if (!isBodyRowAvailable(trait)) {
    return unavailableEffectiveAccess(speciesAccess)
  }

  return speciesAccess
}

/** Maps a body availability boolean to a partial campaign-access child shape. */
export function bodyAvailabilityToCampaignAccess(
  available: boolean | undefined,
): ContentCampaignAccess | undefined {
  if (available === false) {
    return { available: false, visibilityMode: 'all_players', participantIds: [] }
  }

  return undefined
}

export function resolveDefaultSpeciesAccess(
  access: ResolvedContentCampaignAccess | undefined,
): ResolvedContentCampaignAccess {
  return access ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS
}
