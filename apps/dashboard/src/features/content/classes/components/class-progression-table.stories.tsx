import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CharacterClass } from '@rpg/contracts'

import { pickClass } from '../../lib/fixtures/pick'
import { ClassProgressionTable } from './class-progression-table'

const meta = {
  title: 'Content/Classes/ClassProgressionTable',
  component: ClassProgressionTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ClassProgressionTable>

export default meta
type Story = StoryObj

const BARBARIAN: CharacterClass = {
  ...pickClass('barbarian'),
  features: [
    { kind: 'custom', id: 'rage', name: 'Rage', level: 1 },
    { kind: 'custom', id: 'unarmored-defense', name: 'Unarmored Defense', level: 1 },
  ],
}

const ALWAYS_PREPARED_CLERIC: CharacterClass = {
  ...pickClass('cleric'),
  spellcasting: {
    ...pickClass('cleric').spellcasting!,
    preparation: 'full_list',
    spellsAvailable: undefined,
  },
}

export const NonSpellcaster: Story = {
  name: 'Barbarian (non-spellcaster)',
  args: { characterClass: BARBARIAN },
}

export const FullCaster: Story = {
  name: 'Bard (full caster)',
  args: { characterClass: pickClass('bard') },
}

export const PreparedSpells: Story = {
  name: 'Sorcerer (prepared spells table)',
  args: { characterClass: pickClass('sorcerer') },
}

export const KnownSpells: Story = {
  name: 'Warlock (known preparation, cantrips only)',
  args: { characterClass: pickClass('warlock') },
}

export const AlwaysPrepared: Story = {
  name: 'Cleric (always prepared — no count column)',
  args: { characterClass: ALWAYS_PREPARED_CLERIC },
}
