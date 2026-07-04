import type { Meta, StoryObj } from '@storybook/react-vite'

import { CharacterBuilderValidationAlert } from './character-builder-validation-alert.client'

const meta = {
  title: 'Character Builder/CharacterBuilderValidationAlert',
  component: CharacterBuilderValidationAlert,
} satisfies Meta<typeof CharacterBuilderValidationAlert>

export default meta
type Story = StoryObj<typeof CharacterBuilderValidationAlert>

export const WithIssues: Story = {
  args: {
    issues: [
      {
        code: 'identity_name_required',
        message: 'Name is required.',
        path: 'identity.name',
        stepId: 'identity',
      },
      {
        code: 'species_required',
        message: 'Choose a species.',
        path: 'species.speciesId',
        stepId: 'species',
      },
    ],
  },
}
