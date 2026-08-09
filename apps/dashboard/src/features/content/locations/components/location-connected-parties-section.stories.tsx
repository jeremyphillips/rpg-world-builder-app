import type { Meta, StoryObj } from '@storybook/react-vite'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { LocationConnectedPartiesSection } from './location-connected-parties-section.client'

import type { Location, LocationConnectedPartyRow } from '@rpg/contracts'

const sampleLocation = {
  id: 'region-1',
  campaignId: STORY_CAMPAIGN_ID,
  name: 'Lankhmar',
  slug: 'lankhmar',
  kind: 'region',
} as Location

const meta = {
  title: 'Content/Locations/LocationConnectedPartiesSection',
  component: LocationConnectedPartiesSection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof LocationConnectedPartiesSection>

export default meta
type Story = StoryObj<typeof LocationConnectedPartiesSection>

const sampleRows: LocationConnectedPartyRow[] = [
  {
    relationshipId: 'rel-org-1',
    subjectType: 'organization',
    subject: { type: 'organization', id: 'org-1', name: 'City Council', slug: 'council' },
    kind: 'governs',
    label: 'Governs',
    family: 'territorial_authority',
    priority: 50,
    sectionGroup: 'territorial_authority',
  },
]

const peopleKindSlots = [
  {
    heading: 'Operates in',
    bindings: [{ subjectType: 'organization' as const, kind: 'operates_in' as const }],
  },
  {
    heading: 'Works at',
    bindings: [{ subjectType: 'character' as const, kind: 'works_at' as const }],
  },
]

export const TerritorialAuthority: Story = {
  args: {
    campaignId: STORY_CAMPAIGN_ID,
    location: sampleLocation,
    sectionGroup: 'territorial_authority',
    rows: sampleRows,
    canManage: true,
    showEmptySection: true,
  },
}

export const ManagerEmptyPeople: Story = {
  args: {
    campaignId: STORY_CAMPAIGN_ID,
    location: sampleLocation,
    sectionGroup: 'people_and_organizations',
    rows: [],
    canManage: true,
    showEmptySection: true,
    peopleKindSlots,
    canAddToPeopleSection: true,
    onAddPeopleSection: () => undefined,
  },
}
