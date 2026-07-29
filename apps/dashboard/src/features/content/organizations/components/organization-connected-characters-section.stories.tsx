import type { Meta, StoryObj } from '@storybook/react-vite'

import { ORGANIZATION_CONNECTED_CHARACTERS_LOAD_ERROR } from '../lib/organization-connected-characters.constants'
import { OrganizationConnectedCharactersSection } from './organization-connected-characters-section.client'
import { ORGANIZATION_EMPTY_SECTION_TEXT } from '../lib/organization-display'

const meta = {
  title: 'Content/Organizations/OrganizationConnectedCharactersSection',
  component: OrganizationConnectedCharactersSection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof OrganizationConnectedCharactersSection>

export default meta
type Story = StoryObj<typeof OrganizationConnectedCharactersSection>

export const WithPreview: Story = {
  args: {
    connectedCharacters: {
      previewItems: [
        {
          card: {
            id: 'char-1',
            name: 'Verna',
            summary: 'Dwarf · Level 1 Fighter',
          },
          detailHref: '/campaigns/camp-1/characters/char-1',
        },
        {
          card: {
            id: 'npc-1',
            name: 'Circle Envoy',
            summary: 'Human · Level 3 Rogue',
          },
          detailHref: '/campaigns/camp-1/npcs/npc-1',
        },
      ],
      total: 5,
      emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedCharacters,
    },
  },
}

export const Empty: Story = {
  args: {
    connectedCharacters: {
      previewItems: [],
      total: 0,
      emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedCharacters,
    },
  },
}

export const Loading: Story = {
  args: {
    connectedCharacters: {
      previewItems: [],
      total: 0,
      emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedCharacters,
    },
    isPending: true,
  },
}

export const Error: Story = {
  args: {
    connectedCharacters: {
      previewItems: [],
      total: 0,
      emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedCharacters,
    },
    isError: true,
    errorText: ORGANIZATION_CONNECTED_CHARACTERS_LOAD_ERROR,
  },
}
