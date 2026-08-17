import type { CampaignNpcDetail, CampaignNpcListItem, PcCharacter } from '@rpg/contracts'
import { createDefaultCampaignRosterState, createDefaultCharacterVitalState } from '@rpg/contracts'

import { CONTENT_TIMESTAMP, STORY_RULESET_ID } from '../../constants'

/** Minimal persisted PC for character detail stories and tests. */
export function makePcCharacter(overrides: Partial<PcCharacter> = {}): PcCharacter {
  const id = overrides.id ?? 'char-sample-1'

  return {
    id,
    characterType: 'pc',
    userId: overrides.userId ?? 'user-sample',
    name: overrides.name ?? 'Verna',
    rulesetId: overrides.rulesetId ?? STORY_RULESET_ID,
    classes: overrides.classes ?? [{ classId: `${STORY_RULESET_ID}:fighter`, level: 1 }],
    species: overrides.species ?? { id: `${STORY_RULESET_ID}:dwarf` },
    alignment: overrides.alignment ?? 'ng',
    xp: overrides.xp ?? 0,
    abilityScores: overrides.abilityScores ?? {
      str: 15,
      dex: 14,
      con: 13,
      int: 12,
      wis: 10,
      cha: 8,
    },
    hitPoints: overrides.hitPoints ?? { base: 11, current: 11, temporary: 0 },
    proficiencies: overrides.proficiencies ?? {
      skills: [],
      weapons: [],
      armor: [],
      tools: [],
      languages: [],
    },
    spells: overrides.spells ?? [],
    equipment: overrides.equipment ?? {
      weapons: [],
      armor: [],
      tools: [],
      gear: [],
      magicItems: [],
      vehicles: [],
      mounts: [],
    },
    wealth: overrides.wealth ?? { cp: 0, sp: 0, gp: 0, pp: 0 },
    connections: overrides.connections ?? { organizations: [], locations: [] },
    feats: overrides.feats ?? [],
    vital: overrides.vital ?? createDefaultCharacterVitalState(),
    narrative: overrides.narrative ?? {
      backstory: 'A hardy dwarf fighter from the northern holds.',
    },
    createdAt: overrides.createdAt ?? CONTENT_TIMESTAMP,
    updatedAt: overrides.updatedAt ?? CONTENT_TIMESTAMP,
    ...overrides,
  }
}

/** @deprecated Prefer makePcCharacter() — kept for existing imports. */
export const SAMPLE_PC = makePcCharacter()

const DEFAULT_JOINED_AT = CONTENT_TIMESTAMP

const DEFAULT_NPC_LIST_CHARACTER: CampaignNpcListItem['character'] = {
  id: 'npc-1',
  name: 'Captain Aldric',
  vital: createDefaultCharacterVitalState(),
  classes: [{ classId: `${STORY_RULESET_ID}:fighter`, level: 1 }],
  species: { id: `${STORY_RULESET_ID}:dwarf` },
}

const DEFAULT_NPC_LIST_PARTICIPATION = {
  roster: createDefaultCampaignRosterState(),
  joinedAt: DEFAULT_JOINED_AT,
} satisfies Omit<CampaignNpcListItem['participation'], 'id'>

export function makeCampaignNpcListItem(
  overrides: {
    character?: Partial<CampaignNpcListItem['character']>
    participation?: Partial<CampaignNpcListItem['participation']>
  } = {},
): CampaignNpcListItem {
  const character = { ...DEFAULT_NPC_LIST_CHARACTER, ...overrides.character }
  const participation = {
    id: overrides.participation?.id ?? `participation-${character.id}`,
    ...DEFAULT_NPC_LIST_PARTICIPATION,
    ...overrides.participation,
  }

  return { character, participation }
}

export function makeCampaignNpcDetail(
  overrides: {
    character?: Partial<CampaignNpcDetail['character']>
    participation?: Partial<CampaignNpcDetail['participation']>
  } = {},
): CampaignNpcDetail {
  const listItem = makeCampaignNpcListItem(overrides)

  return {
    character: {
      ...makePcCharacter(),
      ...overrides.character,
      id: listItem.character.id,
      characterType: 'npc',
      userId: undefined,
      name: listItem.character.name,
      vital: listItem.character.vital,
      classes: listItem.character.classes,
      species: listItem.character.species,
    },
    participation: {
      id: listItem.participation.id,
      campaignId: overrides.participation?.campaignId ?? 'campaign-1',
      characterId: listItem.character.id,
      roster: listItem.participation.roster,
      joinedAt: listItem.participation.joinedAt,
      ...(overrides.participation?.leftAt !== undefined
        ? { leftAt: overrides.participation.leftAt }
        : {}),
    },
  }
}
