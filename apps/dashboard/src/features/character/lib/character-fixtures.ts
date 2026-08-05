import type { PcCharacter, CampaignNpcListItem, CampaignNpcDetail } from '@rpg/contracts'
import { createDefaultCampaignRosterState, createDefaultCharacterVitalState } from '@rpg/contracts'

/** Minimal persisted PC for character detail stories and tests. */
export const SAMPLE_PC: PcCharacter = {
  id: 'char-sample-1',
  characterType: 'pc',
  userId: 'user-sample',
  name: 'Verna',
  rulesetId: 'srd-cc-5.2.1',
  classes: [{ classId: 'srd-cc-5.2.1:fighter', level: 1 }],
  species: { id: 'srd-cc-5.2.1:dwarf' },
  alignment: 'ng',
  xp: 0,
  abilityScores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
  hitPoints: { base: 11, current: 11, temporary: 0 },
  proficiencies: { skills: [], weapons: [], armor: [], tools: [], languages: [] },
  spells: [],
  equipment: {
    weapons: [],
    armor: [],
    tools: [],
    gear: [],
    magicItems: [],
    vehicles: [],
    mounts: [],
  },
  wealth: { cp: 0, sp: 0, gp: 0, pp: 0 },
  connections: { organizations: [], locations: [] },
  feats: [],
  vital: createDefaultCharacterVitalState(),
  narrative: { backstory: 'A hardy dwarf fighter from the northern holds.' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const DEFAULT_JOINED_AT = '2026-01-01T00:00:00.000Z'

const DEFAULT_NPC_LIST_CHARACTER: CampaignNpcListItem['character'] = {
  id: 'npc-1',
  name: 'Captain Aldric',
  vital: createDefaultCharacterVitalState(),
  classes: [{ classId: 'srd-cc-5.2.1:fighter', level: 1 }],
  species: { id: 'srd-cc-5.2.1:dwarf' },
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
      ...SAMPLE_PC,
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
