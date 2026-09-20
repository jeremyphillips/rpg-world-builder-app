import type { Meta, StoryObj } from '@storybook/react-vite'

import { makeCharacterClass } from '@/test/fixtures/factories/character-class'
import { pickClass } from '../../../lib/fixtures/pick'
import { srdSpellcastingProgressionFixture } from '../../lib/fixtures/spellcasting-progression-fixture'
import { ClassProgressionTable } from './class-progression-table'

const SPELLCASTING_PROGRESSION = srdSpellcastingProgressionFixture()

const meta = {
  title: 'Content/Classes/ClassProgressionTable',
  component: ClassProgressionTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ClassProgressionTable>

export default meta
type Story = StoryObj

const BARBARIAN = makeCharacterClass({
  ...pickClass('barbarian'),
  features: [
    { kind: 'custom', id: 'rage', name: 'Rage', level: 1 },
    { kind: 'custom', id: 'unarmored-defense', name: 'Unarmored Defense', level: 1 },
  ],
})

export const NonSpellcaster: Story = {
  name: 'Barbarian (non-spellcaster)',
  args: { characterClass: BARBARIAN, spellcastingProgression: SPELLCASTING_PROGRESSION },
}

export const FullCaster: Story = {
  name: 'Bard (full caster)',
  args: { characterClass: pickClass('bard'), spellcastingProgression: SPELLCASTING_PROGRESSION },
}

export const PreparedSpells: Story = {
  name: 'Sorcerer (prepared spells table)',
  args: {
    characterClass: pickClass('sorcerer'),
    spellcastingProgression: SPELLCASTING_PROGRESSION,
  },
}

export const KnownSpells: Story = {
  name: 'Warlock (known preparation, cantrips only)',
  args: { characterClass: pickClass('warlock'), spellcastingProgression: SPELLCASTING_PROGRESSION },
}

export const AlwaysPrepared: Story = {
  name: 'Cleric (prepared loadout profile)',
  args: { characterClass: pickClass('cleric'), spellcastingProgression: SPELLCASTING_PROGRESSION },
}
