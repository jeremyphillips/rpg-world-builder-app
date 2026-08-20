import type { OrganizationMemberRowVm } from '../../lib/members/build-organization-member-rows'

export const ORGANIZATION_MEMBER_ROWS: OrganizationMemberRowVm[] = [
  {
    characterId: 'npc-1',
    characterType: 'npc',
    name: 'Circle Envoy',
    title: 'Speaker',
    priority: 50,
    identityLine: 'NPC · Human · Level 3 Rogue',
    detailHref: '/campaigns/camp-1/npcs/npc-1',
  },
  {
    characterId: 'char-1',
    characterType: 'pc',
    name: 'Verna',
    identityLine: 'PC · Dwarf · Level 1 Fighter',
    detailHref: '/campaigns/camp-1/characters/char-1',
  },
]
