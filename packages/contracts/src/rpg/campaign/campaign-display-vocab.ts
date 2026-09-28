import type { CampaignStatus } from './campaign'
import { CAMPAIGN_STATUSES } from './campaign'
import { CAMPAIGN_ROLE_ENTRIES, type CampaignRole } from '../../shared/roles'
import { getTermSentenceForm, type GameTermEntry, type VocabularyTerm } from '../vocab/types'
import { isCampaignManager } from './is-campaign-manager'

export const CAMPAIGN_STATUS_TERM = {
  label: 'Campaign status',
  description: 'Lifecycle state of a campaign in the authoring product.',
  sentence: {
    singular: 'campaign status',
    plural: 'campaign statuses',
  },
} as const satisfies VocabularyTerm

export const CAMPAIGN_STATUS_ENTRIES = {
  draft: {
    label: 'Draft',
    description: 'Campaign is being set up and is not yet active for play.',
    sentence: { singular: 'draft', plural: 'drafts' },
  },
  active: {
    label: 'Active',
    description: 'Campaign is in active play.',
    sentence: { singular: 'active', plural: 'active' },
  },
  archived: {
    label: 'Archived',
    description: 'Campaign is closed to new play.',
    sentence: { singular: 'archived', plural: 'archived' },
  },
} as const satisfies Record<CampaignStatus, GameTermEntry>

export const GAME_MASTER_DISPLAY_STYLES = ['gm', 'dm'] as const

export type GameMasterDisplayStyle = (typeof GAME_MASTER_DISPLAY_STYLES)[number]

export const DEFAULT_GAME_MASTER_DISPLAY_STYLE: GameMasterDisplayStyle = 'gm'

export const GAME_MASTER_DISPLAY_STYLE_TERM = {
  label: 'Game master label',
  description: 'Short label used for campaign managers in viewer-facing copy.',
  sentence: {
    singular: 'game master label',
    plural: 'game master labels',
  },
} as const satisfies VocabularyTerm

export const GAME_MASTER_DISPLAY_STYLE_ENTRIES = {
  gm: {
    label: 'GM',
    description: 'Game master abbreviation for manager-facing viewer copy.',
    sentence: { singular: 'game master', plural: 'game masters' },
  },
  dm: {
    label: 'DM',
    description: 'Dungeon master abbreviation for manager-facing viewer copy.',
    sentence: { singular: 'dungeon master', plural: 'dungeon masters' },
  },
} as const satisfies Record<GameMasterDisplayStyle, GameTermEntry>

/** Matches {@link CHARACTER_TYPE_ENTRIES.pc.label} — kept here to avoid campaign → runtime imports. */
const PLAYER_CHARACTER_ABBREV = 'PC'

export type CampaignViewerFacetLabel = string

export function resolveGameMasterShortLabel(style: GameMasterDisplayStyle): string {
  return GAME_MASTER_DISPLAY_STYLE_ENTRIES[style].label
}

export function resolveCampaignViewerFacetLabel(
  role: CampaignRole,
  gameMasterStyle: GameMasterDisplayStyle,
): CampaignViewerFacetLabel {
  if (isCampaignManager(role)) {
    return resolveGameMasterShortLabel(gameMasterStyle)
  }

  if (role === 'pc') {
    return CAMPAIGN_ROLE_ENTRIES.pc.label
  }

  return CAMPAIGN_ROLE_ENTRIES.observer.label
}

export function resolveCampaignStatusLabel(status: CampaignStatus): string {
  return CAMPAIGN_STATUS_ENTRIES[status].label
}

export function formatCampaignPlayerMemberCount(count: number): string {
  const phrase = getTermSentenceForm(CAMPAIGN_ROLE_ENTRIES.pc, count)
  return `${count} ${phrase}`
}

export function formatCampaignOpenPcCount(count: number): string {
  const suffix = count === 1 ? PLAYER_CHARACTER_ABBREV : `${PLAYER_CHARACTER_ABBREV}s`
  return `${count} ${suffix}`
}

/** Guard for exhaustive status maps in UI formatters. */
export const CAMPAIGN_STATUS_IDS = CAMPAIGN_STATUSES
