import type { Meta, StoryObj } from '@storybook/react-vite'

import { OrganizationConnectedCharacterPreviewList } from './organization-connected-character-preview-list.client'

const meta = {
  title: 'Content/Organizations/OrganizationConnectedCharacterPreviewList',
  component: OrganizationConnectedCharacterPreviewList,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof OrganizationConnectedCharacterPreviewList>

export default meta
type Story = StoryObj<typeof meta>

export const WithOverflow: Story = {
  args: {
    items: [
      {
        summary: {
          id: 'char-1',
          name: 'Verna',
          identitySummary: 'Dwarf · Level 1 Fighter',
          characterType: { value: 'pc', label: 'PC' },
        },
        detailHref: '/campaigns/camp-1/characters/char-1',
      },
      {
        summary: {
          id: 'npc-1',
          name: 'Circle Envoy',
          identitySummary: 'Human · Level 3 Rogue',
          characterType: { value: 'npc', label: 'NPC' },
        },
        detailHref: '/campaigns/camp-1/npcs/npc-1',
      },
    ],
    total: 5,
  },
}

export const SingleItem: Story = {
  args: {
    items: [
      {
        summary: {
          id: 'char-1',
          name: 'Verna',
          identitySummary: 'Dwarf · Level 1 Fighter',
          characterType: { value: 'pc', label: 'PC' },
        },
        detailHref: '/campaigns/camp-1/characters/char-1',
      },
    ],
    total: 1,
  },
}
