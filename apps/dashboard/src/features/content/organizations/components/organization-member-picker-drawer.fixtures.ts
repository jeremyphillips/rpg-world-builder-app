import type { OrganizationDomain } from '@rpg/contracts'

import { pickClass } from '@/test/fixtures/pick'

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

export const ORGANIZATION_MEMBER_PICKER_AVAILABLE_CLASSES = [
  pickClass('fighter'),
  pickClass('rogue'),
  pickClass('wizard'),
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
