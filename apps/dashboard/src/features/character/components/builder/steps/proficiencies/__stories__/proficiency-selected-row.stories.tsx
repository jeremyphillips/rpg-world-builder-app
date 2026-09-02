import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  createProficienciesStepRogueFixture,
  proficienciesStepStealthSkill,
} from '../../../../../lib/proficiencies/proficiencies-step.fixtures'
import { ProficiencySelectedRow } from '../proficiency-selected-row'

const base = createProficienciesStepRogueFixture()
const skillChoiceSetId = base.resolvedChoiceSets.find(
  (choiceSet) => choiceSet.choiceType === 'skillProficiency',
)!.id
const { model } = createProficienciesStepRogueFixture({
  choiceSelections: {
    [skillChoiceSetId]: [proficienciesStepStealthSkill.id, 'removed-skill'],
  },
})
const selectedRow = model.sections
  .find((section) => section.kind === 'skills')!
  .choices[0]!.selectedRows.find((row) => row.optionId === proficienciesStepStealthSkill.id)!
const staleRow = model.sections
  .find((section) => section.kind === 'skills')!
  .choices[0]!.selectedRows.find((row) => row.optionId === 'removed-skill')!

const meta = {
  title: 'Character Builder/ProficiencySelectedRow',
  component: ProficiencySelectedRow,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProficiencySelectedRow>

export default meta
type Story = StoryObj<typeof ProficiencySelectedRow>

export const Selected: Story = {
  args: {
    row: selectedRow,
    onRemove: () => undefined,
  },
}

export const Stale: Story = {
  args: {
    row: staleRow,
    onRemove: () => undefined,
  },
}
