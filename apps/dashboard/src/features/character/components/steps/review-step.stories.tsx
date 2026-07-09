import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { createStandaloneBuilderContextFixture } from '../../lib/character-builder-fixtures'
import { ReviewStep } from './review-step.client'

const meta = {
  title: 'Character Builder/ReviewStep',
  component: ReviewStep,
  args: {
    context: createStandaloneBuilderContextFixture(),
    draft: createEmptyCharacterBuilderDraft(),
    preview: null,
    resolvedChoiceSets: [],
    validationIssues: [],
    onNavigateToStep: fn(),
  },
} satisfies Meta<typeof ReviewStep>

export default meta
type Story = StoryObj<typeof ReviewStep>

export const Incomplete: Story = {
  args: {
    validationIssues: [
      {
        code: 'name_required',
        message: 'Enter a character name.',
        path: 'identity.name',
        stepId: 'identity',
      },
    ],
    resolvedChoiceSets: [
      {
        id: 'class:srd-cc-5.2.1:fighter:class-skills',
        sourceType: 'class',
        sourceId: 'srd-cc-5.2.1:fighter',
        choiceType: 'skillProficiency',
        label: 'Choose Skills',
        min: 2,
        max: 2,
        options: [{ id: 'srd-cc-5.2.1:athletics', label: 'Athletics' }],
        required: true,
      },
    ],
    preview: {
      abilityScores: {},
      savingThrows: [],
      skills: [],
      proficiencies: {
        skills: [],
        weapons: [],
        armor: [],
        tools: [],
        languages: [],
      },
      proficiencyBonus: undefined,
      maxHp: undefined,
      ac: undefined,
      spellcasting: null,
      equipmentSummary: [],
      unresolvedChoiceSetIds: ['class:srd-cc-5.2.1:fighter:class-skills'],
      warnings: [],
    },
  },
}

export const Ready: Story = {
  args: {
    draft: {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Verna', alignment: 'ng' },
      species: { speciesId: 'srd-cc-5.2.1:dwarf' },
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
      abilities: {
        method: 'standard-array',
        scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      },
    },
    preview: {
      abilityScores: {},
      savingThrows: [],
      skills: [],
      proficiencies: {
        skills: [],
        weapons: [],
        armor: [],
        tools: [],
        languages: [],
      },
      proficiencyBonus: 2,
      maxHp: 11,
      ac: 14,
      spellcasting: null,
      equipmentSummary: [],
      unresolvedChoiceSetIds: [],
      warnings: [],
    },
  },
}
