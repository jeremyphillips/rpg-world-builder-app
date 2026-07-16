import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import {
  createEmptyCharacterBuilderDraft,
  resolveAvailableChoices,
  type ChoiceSet,
} from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from '../lib/character-builder-fixtures'
import { CHOICE_SET_COMBOBOX_OPTION_THRESHOLD } from '../lib/choice-set-field.lib'
import { ChoiceSetField } from './choice-set-field.client'

const context = createPopulatedStandaloneBuilderContextFixture()
const languageChoiceSet = resolveAvailableChoices(createEmptyCharacterBuilderDraft(), context).find(
  (choiceSet) => choiceSet.choiceType === 'language',
)!

const heritageChoiceSet = {
  id: 'species:srd-cc-5.2.1:elf:heritage',
  sourceType: 'species',
  sourceId: 'srd-cc-5.2.1:elf',
  choiceType: 'trait',
  label: 'Elven Heritage',
  min: 1,
  max: 1,
  options: [
    { id: 'high-elf', label: 'High Elf', description: 'Cantrip from the wizard spell list.' },
    { id: 'wood-elf', label: 'Wood Elf', description: '+5 ft. walking speed.' },
  ],
  required: true,
} satisfies ChoiceSet

const classSkillsChoiceSet = {
  id: 'class:srd-cc-5.2.1:fighter:skills',
  sourceType: 'class',
  sourceId: 'srd-cc-5.2.1:fighter',
  choiceType: 'skillProficiency',
  label: 'Fighter Skills',
  min: 2,
  max: 2,
  options: [
    { id: 'athletics', label: 'Athletics' },
    { id: 'insight', label: 'Insight' },
    { id: 'perception', label: 'Perception' },
    { id: 'survival', label: 'Survival' },
  ],
  required: true,
} satisfies ChoiceSet

const toolPoolChoiceSet = {
  id: 'class:srd-cc-5.2.1:bard:tools',
  sourceType: 'class',
  sourceId: 'srd-cc-5.2.1:bard',
  choiceType: 'toolProficiency',
  label: 'Artisan Tools',
  min: 1,
  max: 1,
  options: Array.from({ length: CHOICE_SET_COMBOBOX_OPTION_THRESHOLD + 3 }, (_, index) => ({
    id: `tool-${index}`,
    label: `Artisan Tool ${index + 1}`,
    description: `Tool category ${index + 1}`,
  })),
  required: true,
} satisfies ChoiceSet

function ChoiceSetFieldDemo({
  choiceSet,
  initialValue = [],
}: {
  choiceSet: ChoiceSet
  initialValue?: string[]
}) {
  const [value, setValue] = useState(initialValue)

  return <ChoiceSetField choiceSet={choiceSet} value={value} onValueChange={setValue} />
}

const meta = {
  title: 'Character Builder/ChoiceSetField',
  component: ChoiceSetField,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ChoiceSetField>

export default meta
type Story = StoryObj<typeof ChoiceSetField>

export const SinglePickCard: Story = {
  render: () => <ChoiceSetFieldDemo choiceSet={heritageChoiceSet} />,
}

export const MultiPickChips: Story = {
  render: () => <ChoiceSetFieldDemo choiceSet={classSkillsChoiceSet} />,
}

export const SearchablePool: Story = {
  render: () => <ChoiceSetFieldDemo choiceSet={toolPoolChoiceSet} />,
}

export const OriginLanguages: Story = {
  render: () => (
    <ChoiceSetFieldDemo choiceSet={languageChoiceSet} initialValue={['elvish', 'dwarvish']} />
  ),
}
