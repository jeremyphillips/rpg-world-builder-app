import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  createProficienciesStepRogueFixture,
  proficienciesStepAcrobaticsSkill,
  proficienciesStepStealthSkill,
} from '../../../../lib/proficiencies/proficiencies-step.fixtures'
import { ProficiencyChoiceSection } from './proficiency-choice-section.client'

const { model } = createProficienciesStepRogueFixture()
const emptyChoice = model.sections.find((section) => section.kind === 'skills')!.choices[0]!

const base = createProficienciesStepRogueFixture()
const skillChoiceSetId = base.resolvedChoiceSets.find(
  (choiceSet) => choiceSet.choiceType === 'skillProficiency',
)!.id
const { model: fullModel } = createProficienciesStepRogueFixture({
  choiceSelections: {
    [skillChoiceSetId]: [proficienciesStepStealthSkill.id, proficienciesStepAcrobaticsSkill.id],
  },
})
const fullChoice = fullModel.sections.find((section) => section.kind === 'skills')!.choices[0]!

const meta = {
  title: 'Character Builder/ProficiencyChoiceSection',
  component: ProficiencyChoiceSection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProficiencyChoiceSection>

export default meta
type Story = StoryObj<typeof ProficiencyChoiceSection>

export const Empty: Story = {
  args: {
    choice: emptyChoice,
    onOpenDrawer: () => undefined,
    onRemove: () => undefined,
  },
}

export const SelectionFull: Story = {
  args: {
    choice: fullChoice,
    onOpenDrawer: () => undefined,
    onRemove: () => undefined,
  },
}
