import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  characterBuilderValidationMessages,
  getCharacterBuilderChromeMessages,
} from '@rpg/contracts'

import { CharacterBuilderValidationAlert } from '../character-builder-validation-alert'

const meta = {
  title: 'Character Builder/CharacterBuilderValidationAlert',
  component: CharacterBuilderValidationAlert,
} satisfies Meta<typeof CharacterBuilderValidationAlert>

export default meta
type Story = StoryObj<typeof CharacterBuilderValidationAlert>

export const LocalValidation: Story = {
  args: {
    heading: characterBuilderValidationMessages.completeRequiredFields(),
    issues: [
      {
        code: 'identity_name_required',
        message: 'Enter a name.',
        stepId: 'identity',
      },
      {
        code: 'class_required',
        message: 'Choose a class.',
        stepId: 'class',
      },
    ],
  },
}

export const ApiCreateValidation: Story = {
  args: {
    heading: getCharacterBuilderChromeMessages('campaign_npc').createValidationFailureHeading,
    issues: [
      {
        code: 'invalid_type',
        message: 'Spell access is required.',
        path: 'spells.0.access',
        source: 'api',
        stepId: 'spells',
      },
    ],
  },
}
