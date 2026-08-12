import type { Organization } from '@rpg/contracts'

import type { OrganizationPickerItem } from './organization-picker-drawer.types'

const timestamp = '2026-01-01T00:00:00.000Z'

export const lanternGuild: Organization = {
  id: 'organization-lantern-guild',
  slug: 'lantern-guild',
  rulesetId: 'srd-cc-5.2.1',
  source: 'homebrew',
  status: 'published',
  campaignId: 'campaign-1',
  createdAt: timestamp,
  updatedAt: timestamp,
  name: 'Lantern Guild',
  organizationDomain: 'occupational',
  activities: [],
  description: '<p>Guides and cartographers who keep the old roads open.</p>',
  connections: { locations: [] },
}

export const cityCouncil: Organization = {
  ...lanternGuild,
  id: 'organization-city-council',
  slug: 'city-council',
  name: 'City Council',
  organizationDomain: 'government',
}

export const silverCircle: Organization = {
  ...lanternGuild,
  id: 'organization-silver-circle',
  slug: 'silver-circle',
  name: 'Silver Circle',
  organizationDomain: 'academic',
}

export const organizationPickerItems: OrganizationPickerItem[] = [
  { organization: lanternGuild, selected: true },
  { organization: cityCouncil, selected: false },
  { organization: silverCircle, selected: false },
]
