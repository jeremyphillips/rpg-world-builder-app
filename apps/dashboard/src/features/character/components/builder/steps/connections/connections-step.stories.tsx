import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
  createEmptyCharacterBuilderDraft,
} from '@rpg/contracts'

import { createCampaignNpcBuilderContextFixture } from '../../../../lib/fixtures/character-builder-fixtures'
import {
  cityCouncil,
  lanternGuild,
} from '../../../connections/picker/organization-picker-drawer.fixtures'
import { harborfordSettlement } from '../../../connections/picker/residence-location-picker-drawer.fixtures'
import { ConnectionsStep } from './connections-step'

const context = createCampaignNpcBuilderContextFixture({
  catalog: {
    ...createCampaignNpcBuilderContextFixture().catalog,
    organizations: [lanternGuild, cityCouncil],
  },
})

const meta = {
  title: 'Character Builder/ConnectionsStep',
  component: ConnectionsStep,
  parameters: {
    layout: 'padded',
    msw: {
      handlers: [],
    },
  },
  args: {
    context,
    draft: createEmptyCharacterBuilderDraft(),
    validationIssues: [],
    onDraftChange: () => undefined,
  },
} satisfies Meta<typeof ConnectionsStep>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const Selected: Story = {
  args: {
    draft: {
      ...createEmptyCharacterBuilderDraft(),
      relationshipEdges: [
        {
          id: 'edge-org-1',
          kind: 'organizationMembership',
          characterId: CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
          organizationId: lanternGuild.id,
          details: { lifecycle: 'current', title: 'Guildmaster' },
        },
        {
          id: 'edge-place-1',
          kind: 'resides_at',
          characterId: CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
          locationId: harborfordSettlement.id,
        },
      ],
    },
  },
}

export const StaleSelection: Story = {
  args: {
    draft: {
      ...createEmptyCharacterBuilderDraft(),
      relationshipEdges: [
        {
          id: 'edge-org-missing',
          kind: 'organizationMembership',
          characterId: CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
          organizationId: 'organization-missing',
        },
      ],
    },
  },
}
