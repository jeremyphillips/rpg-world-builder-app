import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { ButtonDropdown } from './button-dropdown.client'

const groups = [
  { id: 'proficiencies', label: 'Proficiencies & training' },
  { id: 'character-options', label: 'Character options' },
  { id: 'combat-traits', label: 'Combat & traits' },
]

const items = [
  {
    id: 'skill-proficiency',
    label: 'Skill proficiency',
    description: 'Grant proficiency with specific skills or a player choice from a pool.',
    groupId: 'proficiencies',
  },
  {
    id: 'weapon-proficiency',
    label: 'Weapon proficiency',
    description: 'Grant proficiency with specific weapons, a category, or a player choice.',
    groupId: 'proficiencies',
  },
  {
    id: 'language',
    label: 'Language',
    description: 'Grant knowledge of a language.',
    groupId: 'character-options',
  },
  {
    id: 'movement-bonus',
    label: 'Movement bonus',
    description: 'Increase a movement mode speed by a preset number of feet.',
    groupId: 'combat-traits',
    searchTerms: [{ text: 'walking speed', weight: 1, role: 'keyword' as const }],
  },
]

const meta = {
  title: 'UI/ButtonDropdown',
  component: ButtonDropdown,
  parameters: { layout: 'padded' },
  args: {
    label: 'Add grant',
    groups,
    items,
    onSelectItem: action('onSelectItem'),
  },
} satisfies Meta<typeof ButtonDropdown>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutSearch: Story = {
  args: {
    enableSearch: false,
  },
}

export const WithDuplicateNote: Story = {
  args: {
    items: [
      ...items,
      {
        id: 'armor-training',
        label: 'Armor training',
        description: 'Already on this feature.',
        groupId: 'proficiencies',
        disabled: true,
        note: 'Already added',
      },
    ],
  },
}
