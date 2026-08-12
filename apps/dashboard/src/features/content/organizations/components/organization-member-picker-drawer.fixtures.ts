import type { OrganizationKind } from '@rpg/contracts'

import type { OrganizationMemberPickerCandidate } from './organization-member-picker-drawer.client'

export const ORGANIZATION_MEMBER_PICKER_ORGANIZATION = {
  id: 'organization-lantern-guild',
  name: 'Lantern Guild',
  organizationKind: 'professional' as OrganizationKind,
}

/** Shuffled input order — the drawer sorts non-members first, then sinks existing members. */
export const ORGANIZATION_MEMBER_PICKER_CANDIDATES: OrganizationMemberPickerCandidate[] = [
  {
    id: 'npc-3',
    name: 'Guild Treasurer',
    summary: 'Halfling · Level 5 Expert',
    characterType: 'npc',
    isMember: true,
    membershipTitle: 'Treasurer',
  },
  {
    id: 'npc-2',
    name: 'Master Aldric',
    summary: 'Human · Level 7 Wizard',
    characterType: 'npc',
    isMember: true,
    membershipTitle: 'Guildmaster',
  },
  {
    id: 'char-1',
    name: 'Verna',
    summary: 'Dwarf · Level 1 Fighter',
    characterType: 'pc',
    isMember: false,
  },
  {
    id: 'npc-1',
    name: 'Circle Envoy',
    summary: 'Human · Level 3 Rogue',
    characterType: 'npc',
    isMember: true,
    membershipTitle: 'Journeyman',
  },
  {
    id: 'npc-4',
    name: 'Silent Partner',
    summary: 'Elf · Level 2 Rogue',
    characterType: 'npc',
    isMember: true,
  },
]
