import type { OrganizationKind } from '@rpg/contracts'

import type { OrganizationMemberPickerCandidate } from './organization-member-picker-drawer.client'

export const ORGANIZATION_MEMBER_PICKER_ORGANIZATION = {
  name: 'Lantern Guild',
  organizationKind: 'professional' as OrganizationKind,
}

export const ORGANIZATION_MEMBER_PICKER_CANDIDATES: OrganizationMemberPickerCandidate[] = [
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
  },
]
