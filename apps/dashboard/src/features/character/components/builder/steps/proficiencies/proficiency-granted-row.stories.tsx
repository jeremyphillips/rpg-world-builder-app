import type { Meta, StoryObj } from '@storybook/react-vite'

import { createProficienciesStepRogueFixture } from '../../../../lib/proficiencies/proficiencies-step.fixtures'
import { ProficiencyGrantedRow } from './proficiency-granted-row'

const { model } = createProficienciesStepRogueFixture()
const savingThrowRow = model.sections.find((section) => section.kind === 'savingThrows')!
  .grantedRows[0]!
const toolRow = model.sections.find((section) => section.kind === 'tools')!.grantedRows[0]!

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
