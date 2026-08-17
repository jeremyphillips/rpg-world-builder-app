import type { CharacterClass, OrganizationDomain } from '@rpg/contracts'

import type { OrganizationMemberPickerCandidate } from './organization-member-picker-drawer.client'

const FIGHTER_CLASS_ID = 'srd-cc-5.2.1:fighter'
const ROGUE_CLASS_ID = 'srd-cc-5.2.1:rogue'
const WIZARD_CLASS_ID = 'srd-cc-5.2.1:wizard'

export const ORGANIZATION_MEMBER_PICKER_ORGANIZATION = {
  id: 'organization-lantern-guild',
  name: 'Lantern Guild',
  organizationDomain: 'occupational' as OrganizationDomain,
  memberClassAffinityIds: [ROGUE_CLASS_ID],
}

function makeClass(slug: string, id: string): CharacterClass {
  return {
    id,
    slug,
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    status: 'published',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    primaryAbilities: ['str'],
    hitDie: 10,
    proficiencies: {
      savingThrows: ['str', 'con'],
      armor: { categories: [], items: [] },
      weapons: { categories: [], items: [] },
      skills: { categories: [], items: [] },
    },
    features: [],
  }
}

export const ORGANIZATION_MEMBER_PICKER_AVAILABLE_CLASSES = [
  makeClass('fighter', FIGHTER_CLASS_ID),
  makeClass('rogue', ROGUE_CLASS_ID),
  makeClass('wizard', WIZARD_CLASS_ID),
]

/** Shuffled input order — the drawer sorts non-members first, then sinks existing members. */
export const ORGANIZATION_MEMBER_PICKER_CANDIDATES: OrganizationMemberPickerCandidate[] = [
  {
    id: 'npc-3',
    name: 'Guild Treasurer',
    summary: 'Halfling · Level 5 Expert',
    characterType: 'npc',
    classIds: [ROGUE_CLASS_ID],
    isMember: true,
    membershipTitle: 'Treasurer',
  },
  {
    id: 'npc-2',
    name: 'Master Aldric',
    summary: 'Human · Level 7 Wizard',
    characterType: 'npc',
    classIds: [WIZARD_CLASS_ID],
    isMember: true,
    membershipTitle: 'Guildmaster',
  },
  {
    id: 'char-1',
    name: 'Verna',
    summary: 'Dwarf · Level 1 Fighter',
    characterType: 'pc',
    classIds: [FIGHTER_CLASS_ID],
    isMember: false,
  },
  {
    id: 'npc-1',
    name: 'Circle Envoy',
    summary: 'Human · Level 3 Rogue',
    characterType: 'npc',
    classIds: [ROGUE_CLASS_ID],
    isMember: true,
    membershipTitle: 'Journeyman',
  },
  {
    id: 'npc-4',
    name: 'Silent Partner',
    summary: 'Elf · Level 2 Rogue',
    characterType: 'npc',
    classIds: [ROGUE_CLASS_ID],
    isMember: true,
  },
  {
    id: 'npc-5',
    name: 'Street Runner',
    summary: 'Human · Level 1 Rogue',
    characterType: 'npc',
    classIds: [ROGUE_CLASS_ID],
    isMember: false,
  },
]
