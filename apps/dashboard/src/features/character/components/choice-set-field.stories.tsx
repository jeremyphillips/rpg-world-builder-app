import type { Meta, StoryObj } from '@storybook/react-vite'

import { createEmptyCharacterBuilderDraft, resolveAvailableChoices } from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from '../lib/character-builder-fixtures'
import { ChoiceSetField } from './choice-set-field.client'

const context = createPopulatedStandaloneBuilderContextFixture()
const languageChoiceSet = resolveAvailableChoices(createEmptyCharacterBuilderDraft(), context).find(
  (choiceSet) => choiceSet.choiceType === 'language',
)!

const meta = {
  title: 'Character Builder/ChoiceSetField',
  component: ChoiceSetField,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ChoiceSetField>

export default meta
type Story = StoryObj<typeof ChoiceSetField>

export const OriginLanguages: Story = {
  render: () => (
    <ChoiceSetField choiceSet={languageChoiceSet} value={[]} onValueChange={() => undefined} />
  ),
}

export const WithSelections: Story = {
  render: () => (
    <ChoiceSetField
      choiceSet={languageChoiceSet}
      value={['elvish', 'dwarvish']}
      onValueChange={() => undefined}
    />
  ),
}
