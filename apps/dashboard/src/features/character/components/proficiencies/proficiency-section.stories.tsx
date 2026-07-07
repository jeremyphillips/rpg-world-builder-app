import type { Meta, StoryObj } from '@storybook/react-vite'

import { createProficienciesStepRogueFixture } from '../../lib/proficiencies-step.fixtures'
import { ProficiencySection } from './proficiency-section.client'

const { model } = createProficienciesStepRogueFixture()
const savingThrows = model.sections.find((section) => section.kind === 'savingThrows')!
const skills = model.sections.find((section) => section.kind === 'skills')!

const meta = {
  title: 'Character Builder/ProficiencySection',
  component: ProficiencySection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProficiencySection>

export default meta
type Story = StoryObj<typeof ProficiencySection>

export const SavingThrows: Story = {
  args: {
    section: savingThrows,
    onOpenChoiceSet: () => undefined,
    onRemoveChoice: () => undefined,
  },
}

export const Skills: Story = {
  args: {
    section: skills,
    onOpenChoiceSet: () => undefined,
    onRemoveChoice: () => undefined,
  },
}
