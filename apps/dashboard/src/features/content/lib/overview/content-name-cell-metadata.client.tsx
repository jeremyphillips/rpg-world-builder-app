'use client'

import { CircleSlash, Lock, Users } from 'lucide-react'
import type { ResolvedContentCampaignAccess } from '@rpg/contracts'
import { InfoTooltip } from '@rpg/ui'

import { resolveCampaignAccessDetail } from '../campaign-access/campaign-access-summary'
import {
  CAMPAIGN_ACCESS_TABLE_DM_ONLY_TOOLTIP,
  CAMPAIGN_ACCESS_TABLE_SELECTED_PLAYERS_TOOLTIP,
  CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_TOOLTIP,
} from '../campaign-access/campaign-access-table-labels'

function formatSelectedPlayersCount(count: number): string {
  return count === 1 ? '1 selected player' : `${count} selected players`
}

type MetadataContent = {
  icon: React.ReactNode
  primary: React.ReactNode
  secondary?: string
  tooltip?: string
  tooltipLabel: string
}

function resolveNameCellMetadata(
  campaignAccess: ResolvedContentCampaignAccess,
): MetadataContent | null {
  if (!campaignAccess.available) {
    const detail = resolveCampaignAccessDetail(campaignAccess)
    return {
      icon: <CircleSlash aria-hidden className="size-3 shrink-0 text-semantic-warning" />,
      primary: <span className="text-semantic-warning">Unavailable</span>,
      secondary: detail,
      tooltip: CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_TOOLTIP,
      tooltipLabel: 'About unavailable campaign access',
    }
  }

  if (campaignAccess.visibilityMode === 'dm_only') {
    return {
      icon: <Lock aria-hidden className="size-3 shrink-0" />,
      primary: resolveCampaignAccessDetail(campaignAccess),
      tooltip: CAMPAIGN_ACCESS_TABLE_DM_ONLY_TOOLTIP,
      tooltipLabel: 'About DM only access',
    }
  }

  if (campaignAccess.visibilityMode === 'specific_players') {
    return {
      icon: <Users aria-hidden className="size-3 shrink-0" />,
      primary: formatSelectedPlayersCount(campaignAccess.participantIds.length),
      tooltip: CAMPAIGN_ACCESS_TABLE_SELECTED_PLAYERS_TOOLTIP,
      tooltipLabel: 'About selected player access',
    }
  }

  return null
}

/** Compact second-line metadata for exceptional campaign-access states in overview name cells. */
export function ContentNameCellMetadata({
  campaignAccess,
}: {
  campaignAccess: ResolvedContentCampaignAccess
}) {
  const content = resolveNameCellMetadata(campaignAccess)
  if (!content) return null

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {content.icon}
      <span className="inline-flex items-center gap-1">
        <span>{content.primary}</span>
        {content.secondary ? (
          <>
            <span aria-hidden>·</span>
            <span>{content.secondary}</span>
          </>
        ) : null}
        {content.tooltip ? (
          <InfoTooltip aria-label={content.tooltipLabel}>{content.tooltip}</InfoTooltip>
        ) : null}
      </span>
    </div>
  )
}
