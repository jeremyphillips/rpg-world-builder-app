'use client'

import { CircleSlash, Lock, Users } from 'lucide-react'
import {
  CONTENT_ACCESS_SPECIFIC_PLAYERS_ENABLED,
  type PlayerContentVisibility,
  type ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import { InfoTooltip } from '@rpg/ui'

import { resolveCampaignAccessDetail } from '../campaign-access/campaign-access-summary'
import {
  CAMPAIGN_ACCESS_TABLE_DM_ONLY_TOOLTIP,
  CAMPAIGN_ACCESS_TABLE_SELECTED_PLAYERS_TOOLTIP,
  CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_TOOLTIP,
} from '../campaign-access/campaign-access-table-labels'
import {
  formatPlayerLimitedVisibilityLabel,
  PLAYER_LIMITED_VISIBILITY_TOOLTIP,
  PLAYER_VISIBLE_ONLY_TO_YOU_LABEL,
  PLAYER_VISIBLE_ONLY_TO_YOU_TOOLTIP,
} from './content-access-metadata-player-labels'

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

function resolveManagerAccessMetadata(
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

export type ContentAccessMetadataProps = {
  campaignAccess: ResolvedContentCampaignAccess
  canManage: boolean
  playerVisibility?: PlayerContentVisibility
}

function resolvePlayerAccessMetadata(
  playerVisibility: PlayerContentVisibility,
): MetadataContent | null {
  if (!CONTENT_ACCESS_SPECIFIC_PLAYERS_ENABLED || playerVisibility.kind !== 'specific') {
    return null
  }

  if (playerVisibility.otherParticipantCount === 0) {
    return {
      icon: <Users aria-hidden className="size-3 shrink-0" />,
      primary: PLAYER_VISIBLE_ONLY_TO_YOU_LABEL,
      tooltip: PLAYER_VISIBLE_ONLY_TO_YOU_TOOLTIP,
      tooltipLabel: 'About limited visibility',
    }
  }

  return {
    icon: <Users aria-hidden className="size-3 shrink-0" />,
    primary: formatPlayerLimitedVisibilityLabel(playerVisibility.otherParticipantCount),
    tooltip: PLAYER_LIMITED_VISIBILITY_TOOLTIP,
    tooltipLabel: 'About limited visibility',
  }
}

/** Line-2 campaign access metadata for managers and granted player viewers. */
export function ContentAccessMetadata({
  campaignAccess,
  canManage,
  playerVisibility = { kind: 'ordinary' },
}: ContentAccessMetadataProps) {
  const content = canManage
    ? resolveManagerAccessMetadata(campaignAccess)
    : resolvePlayerAccessMetadata(playerVisibility)
  if (!content) {
    return null
  }

  return (
    <div className="ml-auto flex items-center gap-1 text-muted-foreground">
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
