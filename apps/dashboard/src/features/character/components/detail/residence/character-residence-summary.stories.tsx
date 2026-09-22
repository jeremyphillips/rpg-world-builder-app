import type { Meta, StoryObj } from '@storybook/react-vite'

import { harborfordSettlement } from '../../connections/picker/residence-location-picker-drawer.fixtures'
import { CharacterResidenceSummary } from './character-residence-summary'

const meta = {
  title: 'Character/CharacterResidenceSummary',
  component: CharacterResidenceSummary,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CharacterResidenceSummary>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    campaignId: 'camp-1',
    locationReferences: [],
  },
}

export const WithResidence: Story = {
  args: {
    campaignId: 'camp-1',
    locationReferences: [
      {
        connection: {
          id: 'conn-1',
          locationId: harborfordSettlement.id,
          kind: 'resides_at',
        },
        location: harborfordSettlement,
      },
    ],
  },
}

export const Editable: Story = {
  args: {
    campaignId: 'camp-1',
    canEdit: true,
    onAddResidence: () => undefined,
    locationReferences: [
      {
        connection: {
          id: 'conn-1',
          locationId: harborfordSettlement.id,
          kind: 'resides_at',
        },
        location: harborfordSettlement,
      },
    ],
  },
}
