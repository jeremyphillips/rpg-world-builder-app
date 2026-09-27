import type { CampaignListItem, CampaignStatus } from '@rpg/contracts'

import { INVALID_DATETIME_FALLBACK, formatRelativeRecency } from '@/lib/datetime/format-datetime'

import type { CampaignDestination } from './recovery/campaign-destination.lib'

export type CampaignMetaStatusTone = 'success' | 'sunken'

export type CampaignMeta = {
  status: CampaignStatus
  statusLabel: string
  statusTone: CampaignMetaStatusTone
  otherMemberCount: number
  openCharacterCount: number
  lastOpenedByViewerAt: string | null
}

const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  active: 'Active',
  draft: 'Draft',
  archived: 'Archived',
}

export function resolveCampaignMetaStatusTone(status: CampaignStatus): CampaignMetaStatusTone {
  return status === 'active' ? 'success' : 'sunken'
}

export function formatCampaignCountsClause(
  otherMemberCount: number,
  openCharacterCount: number,
): string {
  const playerClause = `${otherMemberCount} ${otherMemberCount === 1 ? 'player' : 'players'}`

  if (otherMemberCount === openCharacterCount) {
    return playerClause
  }

  const characterClause = `${openCharacterCount} ${
    openCharacterCount === 1 ? 'character' : 'characters'
  }`
  return `${playerClause} · ${characterClause}`
}

export function buildCampaignMeta(campaign: CampaignListItem): CampaignMeta {
  return {
    status: campaign.status,
    statusLabel: CAMPAIGN_STATUS_LABELS[campaign.status],
    statusTone: resolveCampaignMetaStatusTone(campaign.status),
    otherMemberCount: campaign.otherMemberCount,
    openCharacterCount: campaign.openCharacterCount,
    lastOpenedByViewerAt: campaign.lastOpenedByViewerAt,
  }
}

export function formatCampaignLastOpenedClause(iso: string, now?: Date): string {
  const relative = formatRelativeRecency(iso, now)
  if (relative === INVALID_DATETIME_FALLBACK) return relative

  const phrase =
    relative === 'Yesterday' || relative === 'Today' ? relative.toLowerCase() : relative

  return `Last opened ${phrase}`
}

export type FormatCampaignMetaForSurfaceOptions = {
  includeRecency: boolean
  countsPending?: boolean
  now?: Date
}

export function formatCampaignMetaForSurface(
  meta: CampaignMeta,
  options: FormatCampaignMetaForSurfaceOptions,
): string {
  if (options.countsPending) {
    return meta.statusLabel
  }

  const clauses = [
    meta.statusLabel,
    formatCampaignCountsClause(meta.otherMemberCount, meta.openCharacterCount),
  ]

  if (options.includeRecency && meta.lastOpenedByViewerAt) {
    clauses.push(formatCampaignLastOpenedClause(meta.lastOpenedByViewerAt, options.now))
  }

  return clauses.join(' · ')
}

export function buildCampaignDestinationDescription(
  campaign: CampaignListItem,
  destination: Pick<CampaignDestination, 'supportingCopy'>,
): string {
  if (destination.supportingCopy) {
    return destination.supportingCopy
  }

  return formatCampaignMetaForSurface(buildCampaignMeta(campaign), { includeRecency: true })
}
