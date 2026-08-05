import type { Meta, StoryObj } from '@storybook/react-vite'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { LocationConnectedPartiesSection } from './location-connected-parties-section.client'

const meta = {
  title: 'Content/Locations/LocationConnectedPartiesSection',
  component: LocationConnectedPartiesSection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof LocationConnectedPartiesSection>

export default meta
type Story = StoryObj<typeof LocationConnectedPartiesSection>

const sampleRows = [
  {
    relationshipId: 'rel-org-1',
    subject: { type: 'organization' as const, id: 'org-1', name: 'City Council', slug: 'council' },
    kind: 'governs',
    label: 'Governs',
    family: 'territorial_authority',
    priority: 50,
    sectionGroup: 'territorial_authority' as const,
  },
]

export const TerritorialAuthority: Story = {
  args: {
    campaignId: STORY_CAMPAIGN_ID,
    sectionGroup: 'territorial_authority',
    rows: sampleRows,
    canManage: true,
    showEmptySection: true,
    organizationAddAffordances: [{ intent: 'territorial_authority', label: 'Add authority' }],
    onAddOrganization: () => undefined,
  },
}

export const ManagerEmptyPeople: Story = {
  args: {
    campaignId: STORY_CAMPAIGN_ID,
    sectionGroup: 'people_and_organizations',
    rows: [],
    canManage: true,
    showEmptySection: true,
    organizationAddAffordances: [
      { intent: 'geographic_presence', label: 'Add organization presence' },
    ],
    onAddOrganization: () => undefined,
    onAddCharacter: () => undefined,
  },
}
