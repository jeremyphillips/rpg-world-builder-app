import type { OrganizationPickerItem } from './organization-picker-drawer.types'
import { makeOrganization } from '@/test/fixtures/factories/organization'

const lanternGuildMembershipTitles = [
  { id: 'omt_guildmaster', label: 'Guildmaster', priority: 50 as const },
  { id: 'omt_member', label: 'Member', priority: 20 as const },
] as const

export const lanternGuild = makeOrganization({
  id: 'organization-lantern-guild',
  slug: 'lantern-guild',
  name: 'Lantern Guild',
  organizationDomain: 'occupational',
  description: '<p>Guides and cartographers who keep the old roads open.</p>',
  members: {
    classAffinityIds: [],
    speciesAffinityIds: [],
    titles: [...lanternGuildMembershipTitles],
  },
})

export const cityCouncil = makeOrganization({
  ...lanternGuild,
  id: 'organization-city-council',
  slug: 'city-council',
  name: 'City Council',
  organizationDomain: 'government',
})

export const silverCircle = makeOrganization({
  ...lanternGuild,
  id: 'organization-silver-circle',
  slug: 'silver-circle',
  name: 'Silver Circle',
  organizationDomain: 'academic',
})

export const organizationPickerItems: OrganizationPickerItem[] = [
  { organization: lanternGuild, selected: true },
  { organization: cityCouncil, selected: false },
  { organization: silverCircle, selected: false },
]
