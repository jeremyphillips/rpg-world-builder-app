import type { Meta, StoryObj } from '@storybook/react-vite'
import { CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT } from '@rpg/contracts'

import { createCampaignNpcBuilderContextFixture } from '../../../../lib/fixtures/character-builder-fixtures'
import { buildConnectionsStepData } from '../../../../lib/relationship/connections-step-data.lib'
import {
  cityCouncil,
  lanternGuild,
} from '../../../connections/picker/organization-picker-drawer.fixtures'
import { harborfordSettlement } from '../../../connections/picker/residence-location-picker-drawer.fixtures'
import { ConnectionsStepSection } from './connections-step-section'

const buildContext = createCampaignNpcBuilderContextFixture({
  catalog: {
    ...createCampaignNpcBuilderContextFixture().catalog,
    organizations: [lanternGuild, cityCouncil],
  },
})

const stepData = buildConnectionsStepData({
  buildContext,
  campaignCharacters: [],
  campaignNpcs: [],
  locations: [harborfordSettlement],
  locationsPending: false,
  locationsError: null,
  locationsHasData: true,
})

const relationshipEdges = [
  {
    id: 'edge-org-1',
    kind: 'organizationMembership' as const,
    characterId: CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
    organizationId: lanternGuild.id,
    details: { lifecycle: 'current' as const, title: 'Guildmaster' },
  },
  {
    id: 'edge-place-1',
    kind: 'resides_at' as const,
    characterId: CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
    locationId: harborfordSettlement.id,
    details: { lifecycle: 'current' as const, isPrimary: true },
  },
]

const meta = {
  title: 'Character Builder/Connections/ConnectionsStepSection',
  component: ConnectionsStepSection,
  parameters: { layout: 'padded' },
  args: {
    sectionId: 'organizations' as const,
    relationshipEdges: [],
    stepData,
    campaignId: 'campaign-1',
    onOpenDrawer: () => undefined,
    onEditEdge: () => undefined,
    onRemoveEdge: () => undefined,
  },
} satisfies Meta<typeof ConnectionsStepSection>

export default meta

type Story = StoryObj<typeof meta>

export const EmptyOrganizations: Story = {}

export const PopulatedOrganizations: Story = {
  args: {
    relationshipEdges: [relationshipEdges[0]!],
  },
}

export const PopulatedPlaces: Story = {
  args: {
    sectionId: 'places',
    relationshipEdges: [relationshipEdges[1]!],
  },
}
