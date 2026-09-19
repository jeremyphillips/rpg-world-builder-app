import type { Meta, StoryObj } from '@storybook/react-vite'

import { createProficienciesStepRogueFixture } from '../../../../../lib/proficiencies/proficiencies-step.fixtures'
import { ProficiencyGrantedSummary } from '../proficiency-granted-summary'

const { model } = createProficienciesStepRogueFixture()

const meta = {
  title: 'Character Builder/ProficiencyGrantedSummary',
  component: ProficiencyGrantedSummary,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProficiencyGrantedSummary>

export default meta
type Story = StoryObj<typeof ProficiencyGrantedSummary>

export const Rogue: Story = {
  args: {
    rows: model.fixedGrants,
  },
}
