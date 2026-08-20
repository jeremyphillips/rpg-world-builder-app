import type { Meta, StoryObj } from '@storybook/react-vite'

import { makeOrganization } from '@/test/fixtures/factories/organization'

import { BuildingOrganizationsCreateTab } from './building-organizations-create-tab.client'
import type { BuildingOrganizationDraftPlan } from '../lib/building-organization-create-drafts'

const organizationItems = [
  makeOrganization({
    id: 'organization-existing',
    slug: 'organization-existing',
    name: 'Harbor Merchants Guild',
    organizationDomain: 'commercial',
  }),
  makeOrganization({
    id: 'organization-blocked',
    slug: 'organization-blocked',
    name: 'Test org',
    organizationDomain: 'military',
  }),
]

const mixedPlan: BuildingOrganizationDraftPlan = {
  organizations: [
    {
      draftOrganizationId: 'organization-new',
      values: {
        name: 'Copper Kettle Cooperative',
        organizationDomain: 'commercial',
        functions: [],
        practices: [],
        members: { classAffinityIds: [], speciesAffinityIds: [] },
      },
    },
  ],
  relationships: [
    {
      draftId: 'relationship-existing',
      kind: 'owns',
      organization: { kind: 'existing', organizationId: 'organization-existing' },
    },
    {
      draftId: 'relationship-new',
      kind: 'operator',
      organization: { kind: 'new', draftOrganizationId: 'organization-new' },
    },
  ],
}

const fullyBlockedPlan: BuildingOrganizationDraftPlan = {
  organizations: [],
  relationships: [
    {
      draftId: 'relationship-owns',
      kind: 'owns',
      organization: { kind: 'existing', organizationId: 'organization-blocked' },
    },
    {
      draftId: 'relationship-tenant',
      kind: 'tenant',
      organization: { kind: 'existing', organizationId: 'organization-blocked' },
    },
    {
      draftId: 'relationship-operator',
      kind: 'operator',
      organization: { kind: 'existing', organizationId: 'organization-blocked' },
    },
    {
      draftId: 'relationship-hq',
      kind: 'headquarters',
      organization: { kind: 'existing', organizationId: 'organization-blocked' },
    },
  ],
}

const singleEligiblePlan: BuildingOrganizationDraftPlan = {
  organizations: [],
  relationships: fullyBlockedPlan.relationships.slice(0, 3),
}

const meta = {
  title: 'Features/Locations/Building Organizations Create Tab',
  component: BuildingOrganizationsCreateTab,
  parameters: { layout: 'padded' },
  args: { campaignId: 'storybook-campaign', organizationItems },
} satisfies Meta<typeof BuildingOrganizationsCreateTab>

export default meta
type Story = StoryObj<typeof meta>

export const EmptyResting: Story = {}

export const IntentFirstDiscovery: Story = {
  args: {
    initialComposerMode: 'composing',
  },
}

export const ZeroEligibleIntent: Story = {
  args: {
    initialPlan: fullyBlockedPlan,
    initialComposerMode: 'composing',
  },
}

export const SingleEligibleIntentSummary: Story = {
  args: {
    initialPlan: singleEligiblePlan,
    initialComposerMode: 'composing',
  },
}

export const MixedPendingRelationships: Story = {
  args: {
    initialPlan: mixedPlan,
  },
}

export const PendingEditFocused: Story = {
  args: {
    initialPlan: mixedPlan,
  },
}

export const NewOrganizationBranch: Story = {}
