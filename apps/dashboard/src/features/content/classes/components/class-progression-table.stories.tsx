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

const BASE: Omit<
  CharacterClass,
  | 'name'
  | 'id'
  | 'slug'
  | 'hitDie'
  | 'primaryAbilities'
  | 'proficiencies'
  | 'features'
  | 'spellcasting'
  | 'asiLevels'
  | 'subclassLevels'
> = {
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
}

const BARBARIAN: CharacterClass = {
  ...BASE,
  id: 'srd-cc-5.2.1:barbarian',
  slug: 'barbarian',
  name: 'Barbarian',
  hitDie: 12,
  primaryAbilities: ['str'],
  asiLevels: [4, 8, 12, 16, 19],
  subclassLevels: [3],
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: ['light', 'medium', 'shields'],
    weapons: { categories: ['simple', 'martial'] },
    skills: {
      choose: 2,
      from: ['animal-handling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
    },
  },
  features: [
    { id: 'rage', name: 'Rage', level: 1 },
    { id: 'unarmored-defense', name: 'Unarmored Defense', level: 1 },
  ],
}

const BARD = pickClass('bard')

const SORCERER: CharacterClass = {
  ...BASE,
  id: 'srd-cc-5.2.1:sorcerer',
  slug: 'sorcerer',
  name: 'Sorcerer',
  hitDie: 6,
  primaryAbilities: ['cha'],
  asiLevels: [4, 8, 12, 16, 19],
  subclassLevels: [3],
  spellcasting: {
    progression: 'full',
    ability: 'cha',
    preparation: 'prepared',
    cantrips: [
      { level: 1, known: 4 },
      { level: 4, known: 5 },
      { level: 10, known: 6 },
    ],
    spellsAvailable: [
      { level: 1, count: 2 },
      { level: 2, count: 4 },
      { level: 3, count: 6 },
      { level: 4, count: 7 },
      { level: 5, count: 9 },
      { level: 6, count: 10 },
      { level: 7, count: 11 },
      { level: 8, count: 12 },
      { level: 9, count: 14 },
      { level: 10, count: 15 },
      { level: 11, count: 16 },
      { level: 12, count: 16 },
      { level: 13, count: 17 },
      { level: 14, count: 17 },
      { level: 15, count: 18 },
      { level: 16, count: 18 },
      { level: 17, count: 19 },
      { level: 18, count: 20 },
      { level: 19, count: 21 },
      { level: 20, count: 22 },
    ],
  },
  proficiencies: {
    savingThrows: ['con', 'cha'],
    armor: [],
    weapons: { categories: ['simple'] },
    skills: {
      choose: 2,
      from: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
    },
  },
  features: [
    { id: 'spellcasting', name: 'Spellcasting', level: 1 },
    { id: 'font-of-magic', name: 'Font of Magic', level: 2 },
  ],
  resources: [
    {
      name: 'Sorcery Points',
      entries: Array.from({ length: 19 }, (_, i) => ({ level: i + 2, value: i + 2 })),
    },
  ],
}

export const NonSpellcaster: Story = {
  name: 'Barbarian (non-spellcaster)',
  args: { characterClass: BARBARIAN },
}

export const FullCaster: Story = {
  name: 'Bard (full caster)',
  args: { characterClass: BARD },
}

export const PreparedSpells: Story = {
  name: 'Sorcerer (prepared spells table)',
  args: { characterClass: SORCERER },
}
