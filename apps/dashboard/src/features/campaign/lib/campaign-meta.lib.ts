import type {
  CampaignListItem,
  CampaignRole,
  CampaignStatus,
  GameMasterDisplayStyle,
} from '@rpg/contracts'
import {
  formatCampaignOpenPcCount,
  formatCampaignPlayerMemberCount,
  resolveCampaignStatusLabel,
  resolveCampaignViewerFacetLabel,
} from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

import { INVALID_DATETIME_FALLBACK, formatRelativeRecency } from '@/lib/datetime/format-datetime'

import type { CampaignDestination } from './recovery/campaign-destination.lib'

export type CampaignMetaStatusTone = 'success' | 'sunken'

export type CampaignMeta = {
  campaignRole: CampaignRole
  status: CampaignStatus
  statusLabel: string
  statusTone: CampaignMetaStatusTone
  viewerFacetLabel: string
  playerMemberCount: number
  openPcCount: number
  lastOpenedByViewerAt: string | null
}

export type CampaignMetaSegment =
  | { kind: 'facet'; text: string }
  | { kind: 'status'; text: string }
  | { kind: 'playerCount'; text: string }
  | { kind: 'pcCount'; text: string }
  | { kind: 'recency'; text: string }

export function resolveCampaignMetaStatusTone(status: CampaignStatus): CampaignMetaStatusTone {
  return status === 'active' ? 'success' : 'sunken'
}

export function isCampaignListItem(
  campaign: CampaignListItem | { status: CampaignStatus; identity: { name: string } },
): campaign is CampaignListItem {
  return 'campaignRole' in campaign
}

export function buildCampaignMeta(
  campaign: CampaignListItem,
  gameMasterStyle: GameMasterDisplayStyle,
): CampaignMeta {
  return {
    campaignRole: campaign.campaignRole,
    status: campaign.status,
    statusLabel: resolveCampaignStatusLabel(campaign.status),
    statusTone: resolveCampaignMetaStatusTone(campaign.status),
    viewerFacetLabel: resolveCampaignViewerFacetLabel(campaign.campaignRole, gameMasterStyle),
    playerMemberCount: campaign.playerMemberCount,
    openPcCount: campaign.openPcCount,
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

export type BuildCampaignMetaSegmentsOptions = {
  includeRecency: boolean
  countsPending?: boolean
  now?: Date
}

export function buildCampaignMetaSegments(
  meta: CampaignMeta,
  options: BuildCampaignMetaSegmentsOptions,
): CampaignMetaSegment[] {
  if (options.countsPending) {
    return [
      { kind: 'facet', text: meta.viewerFacetLabel },
      { kind: 'status', text: meta.statusLabel },
    ]
  }

  const segments: CampaignMetaSegment[] = [
    { kind: 'facet', text: meta.viewerFacetLabel },
    { kind: 'status', text: meta.statusLabel },
    { kind: 'playerCount', text: formatCampaignPlayerMemberCount(meta.playerMemberCount) },
  ]

  if (meta.openPcCount !== meta.playerMemberCount) {
    segments.push({ kind: 'pcCount', text: formatCampaignOpenPcCount(meta.openPcCount) })
  }

  if (options.includeRecency && meta.lastOpenedByViewerAt) {
    segments.push({
      kind: 'recency',
      text: formatCampaignLastOpenedClause(meta.lastOpenedByViewerAt, options.now),
    })
  }

  return segments
}

export function formatCampaignMetaPlainText(segments: readonly CampaignMetaSegment[]): string {
  return joinInlineMetadata(segments.map((segment) => segment.text))
}

export function buildCampaignDestinationMeta(
  campaign: CampaignListItem,
  destination: Pick<CampaignDestination, 'supportingCopy'>,
  gameMasterStyle: GameMasterDisplayStyle,
): CampaignMeta | null {
  if (destination.supportingCopy) {
    return null
  }

  return buildCampaignMeta(campaign, gameMasterStyle)
}
