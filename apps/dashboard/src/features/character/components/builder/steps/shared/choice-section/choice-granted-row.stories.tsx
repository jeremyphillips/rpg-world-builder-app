import type { Meta, StoryObj } from '@storybook/react-vite'

import { createProficienciesStepRogueFixture } from '../../../../../lib/proficiencies/proficiencies-step.fixtures'
import { ChoiceGrantedRow } from './choice-granted-row'

const { model } = createProficienciesStepRogueFixture()
const savingThrows = model.fixedGrants.find((row) => row.kind === 'savingThrows')!
const toolsSection = model.sections.find((section) => section.kind === 'tools')!
const toolRow = toolsSection.grantedRows[0]!
const savingThrowRow = {
  id: 'saving-throw:example',
  label: savingThrows.sourceGroups[0]!.valueLabels[0]!,
  sourceLabel: `Granted by ${savingThrows.sourceGroups[0]!.sourceLabel}`,
}

const meta = {
  title: 'Character Builder/ChoiceGrantedRow',
  component: ChoiceGrantedRow,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ChoiceGrantedRow>

export default meta
type Story = StoryObj<typeof ChoiceGrantedRow>

export const SavingThrow: Story = {
  args: {
    row: savingThrowRow,
  },
}

export const Tool: Story = {
  args: {
    row: toolRow,
  },
}
