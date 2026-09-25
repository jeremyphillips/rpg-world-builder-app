import type { CampaignFlavor, CampaignStatus, Mood, PlayStyle } from '@rpg/contracts'

import {
  DIFFICULTY_LABELS,
  MAGIC_LEVEL_LABELS,
  MOOD_LABELS,
  PLAY_STYLE_LABELS,
} from '../settings/campaign-profile-form-labels'

export const CAMPAIGN_OVERVIEW_HERO_BADGE_LIMIT = 4 as const

export type CampaignOverviewHeroStatusTone = 'success' | 'sunken'

export type CampaignOverviewHeroStatusLine = {
  statusLabel: string
  statusTone: CampaignOverviewHeroStatusTone
  countsSuffix?: string
}

export type CampaignOverviewHeroBadge = {
  id: string
  label: string
}

export type CampaignOverviewHeroBadges = {
  visible: CampaignOverviewHeroBadge[]
  overflowCount: number
}

const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  active: 'Active',
  draft: 'Draft',
  archived: 'Archived',
}

export function resolveCampaignOverviewHeroStatusTone(
  status: CampaignStatus,
): CampaignOverviewHeroStatusTone {
  return status === 'active' ? 'success' : 'sunken'
}

export function composeCampaignOverviewHeroStatusLine(input: {
  status: CampaignStatus
  playerCount?: number
  characterCount?: number
  countsPending?: boolean
}): CampaignOverviewHeroStatusLine {
  const statusLabel = CAMPAIGN_STATUS_LABELS[input.status]
  const statusTone = resolveCampaignOverviewHeroStatusTone(input.status)

  if (input.countsPending) {
    return { statusLabel, statusTone }
  }

  const playerCount = input.playerCount ?? 0
  const characterCount = input.characterCount ?? 0
  const playerClause = `${playerCount} ${playerCount === 1 ? 'player' : 'players'}`

  if (playerCount === characterCount) {
    return {
      statusLabel,
      statusTone,
      countsSuffix: playerClause,
    }
  }

  const characterClause = `${characterCount} ${characterCount === 1 ? 'character' : 'characters'}`
  return {
    statusLabel,
    statusTone,
    countsSuffix: `${playerClause} · ${characterClause}`,
  }
}

function buildFlavorBadge(id: string, label: string): CampaignOverviewHeroBadge {
  return { id, label }
}

export function buildCampaignOverviewHeroBadges(
  flavor: CampaignFlavor | undefined,
): CampaignOverviewHeroBadges | undefined {
  if (!flavor) return undefined

  const ordered: CampaignOverviewHeroBadge[] = [
    ...(flavor.playStyle ?? []).map((value: PlayStyle) =>
      buildFlavorBadge(`play-style:${value}`, PLAY_STYLE_LABELS[value]),
    ),
    ...(flavor.mood ?? []).map((value: Mood) =>
      buildFlavorBadge(`mood:${value}`, MOOD_LABELS[value]),
    ),
    ...(flavor.magicLevel
      ? [
          buildFlavorBadge(
            `magic-level:${flavor.magicLevel}`,
            MAGIC_LEVEL_LABELS[flavor.magicLevel],
          ),
        ]
      : []),
    ...(flavor.difficulty
      ? [buildFlavorBadge(`difficulty:${flavor.difficulty}`, DIFFICULTY_LABELS[flavor.difficulty])]
      : []),
  ]

  if (ordered.length === 0) return undefined

  const visible = ordered.slice(0, CAMPAIGN_OVERVIEW_HERO_BADGE_LIMIT)
  const overflowCount = Math.max(0, ordered.length - visible.length)

  return { visible, overflowCount }
}
