import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import {
  EQUIPMENT_CHOOSE_CLASS_PROMPT_DESCRIPTION,
  EQUIPMENT_CHOOSE_CLASS_PROMPT_HEADING,
} from '../../../../lib/equipment/equipment-step.lib'
import {
  PROFICIENCIES_CHOOSE_CLASS_PROMPT_DESCRIPTION,
  PROFICIENCIES_CHOOSE_CLASS_PROMPT_HEADING,
} from '../../../../lib/proficiencies/proficiencies-step.lib'
import {
  SPELLS_CHOOSE_CLASS_PROMPT_DESCRIPTION,
  SPELLS_CHOOSE_CLASS_PROMPT_HEADING,
} from '../../../../lib/spells/spells-step.lib'
import { BuilderStepChooseClassPrompt } from './builder-step-choose-class-prompt'

const meta = {
  title: 'Character Builder/BuilderStepChooseClassPrompt',
  component: BuilderStepChooseClassPrompt,
  args: {
    onNavigateToStep: fn(),
  },
} satisfies Meta<typeof BuilderStepChooseClassPrompt>

export default meta
type Story = StoryObj<typeof meta>

export const Equipment: Story = {
  args: {
    heading: EQUIPMENT_CHOOSE_CLASS_PROMPT_HEADING,
    description: EQUIPMENT_CHOOSE_CLASS_PROMPT_DESCRIPTION,
  },
}

export const Proficiencies: Story = {
  args: {
    heading: PROFICIENCIES_CHOOSE_CLASS_PROMPT_HEADING,
    description: PROFICIENCIES_CHOOSE_CLASS_PROMPT_DESCRIPTION,
  },
}

export const Spells: Story = {
  args: {
    heading: SPELLS_CHOOSE_CLASS_PROMPT_HEADING,
    description: SPELLS_CHOOSE_CLASS_PROMPT_DESCRIPTION,
  },
}
