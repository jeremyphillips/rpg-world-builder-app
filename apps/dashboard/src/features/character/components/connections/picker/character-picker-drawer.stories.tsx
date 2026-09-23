import type { Meta, StoryObj } from '@storybook/react-vite'

import type { CharacterPickerItem } from './character-picker-drawer.types'
import { CharacterPickerDrawer } from './character-picker-drawer'

const characterPickerItems: CharacterPickerItem[] = [
  {
    character: {
      id: 'npc-darius',
      name: 'Darius Vale',
      summary: 'NPC · Rogue 3',
      characterType: 'npc',
      classIds: ['class-rogue'],
    },
    selected: false,
  },
  {
    character: {
      id: 'pc-aria',
      name: 'Aria Thorn',
      summary: 'PC · Wizard 2',
      characterType: 'pc',
      classIds: ['class-wizard'],
    },
    selected: true,
  },
]

const meta = {
  title: 'Character Builder/Connections/CharacterPickerDrawer',
  component: CharacterPickerDrawer,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    items: characterPickerItems,
    onOpenChange: () => undefined,
    onSelect: () => undefined,
  },
} satisfies Meta<typeof CharacterPickerDrawer>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: { items: [] },
}
