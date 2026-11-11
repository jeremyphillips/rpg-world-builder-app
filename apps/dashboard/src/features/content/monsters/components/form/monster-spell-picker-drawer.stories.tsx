import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Spell } from '@rpg/contracts'

import { MonsterSpellPickerDrawer } from './monster-spell-picker-drawer'

const detectThoughts = {
  id: 'detect-thoughts',
  name: 'Detect Thoughts',
  level: 2,
  school: 'divination',
  castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
  range: { kind: 'self' },
  duration: { kind: 'timed', value: 1, unit: 'minute', concentration: true },
} as Spell

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterSpellPickerDrawer',
  component: MonsterSpellPickerDrawer,
  args: {
    open: true,
    mode: 'add',
    spells: [detectThoughts],
    disabledSpellIds: new Set<string>(),
    onOpenChange: () => undefined,
    onCommit: () => undefined,
  },
} satisfies Meta<typeof MonsterSpellPickerDrawer>

export default meta

type Story = StoryObj<typeof meta>

export const AddSpell: Story = {}
