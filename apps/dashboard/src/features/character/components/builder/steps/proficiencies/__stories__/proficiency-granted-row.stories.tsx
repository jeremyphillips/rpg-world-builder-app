import type { Meta, StoryObj } from '@storybook/react-vite'

import { createProficienciesStepRogueFixture } from '../../../../../lib/proficiencies/proficiencies-step.fixtures'
import { ProficiencyGrantedRow } from '../proficiency-granted-row'

const { model } = createProficienciesStepRogueFixture()
const savingThrows = model.fixedGrants.find((row) => row.kind === 'savingThrows')!
const tools = model.fixedGrants.find((row) => row.kind === 'tools')!
const savingThrowRow = {
  id: 'saving-throw:example',
  kind: savingThrows.kind,
  label: savingThrows.sourceGroups[0]!.valueLabels[0]!,
  sourceLabel: savingThrows.sourceGroups[0]!.sourceLabel,
}
const toolRow = {
  id: 'tool:example',
  kind: tools.kind,
  label: tools.sourceGroups[0]!.valueLabels[0]!,
  sourceLabel: tools.sourceGroups[0]!.sourceLabel,
}

const meta = {
  title: 'Character Builder/ProficiencyGrantedRow',
  component: ProficiencyGrantedRow,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProficiencyGrantedRow>

export default meta
type Story = StoryObj<typeof ProficiencyGrantedRow>

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
