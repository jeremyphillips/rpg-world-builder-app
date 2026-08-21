import type { Meta, StoryObj } from '@storybook/react-vite'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { IdentityStep } from './identity-step.client'

const meta = {
  title: 'Character Builder/IdentityStep',
  component: IdentityStep,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof IdentityStep>

export default meta
type Story = StoryObj<typeof IdentityStep>

export const Empty: Story = {
  render: () => (
    <IdentityStep
      draft={createEmptyCharacterBuilderDraft()}
      validationIssues={[]}
      onDraftChange={() => undefined}
      onStepComplete={() => undefined}
      onFormContinueValidationFailed={() => undefined}
    />
  ),
}

export const WithNarrative: Story = {
  render: () => (
    <IdentityStep
      draft={{
        ...createEmptyCharacterBuilderDraft(),
        identity: {
          name: 'Verna',
          alignment: 'ng',
          narrative: {
            personalityTraits: ['Steady under pressure.'],
            ideals: ['Protect the weak.'],
            backstory: '<p>A soldier turned adventurer.</p>',
          },
        },
      }}
      validationIssues={[]}
      onDraftChange={() => undefined}
      onStepComplete={() => undefined}
      onFormContinueValidationFailed={() => undefined}
    />
  ),
}

export const WithValidationIssues: Story = {
  render: () => (
    <IdentityStep
      draft={createEmptyCharacterBuilderDraft()}
      validationIssues={[
        {
          code: 'identity.name.required',
          message: 'Name is required.',
          stepId: 'identity',
        },
      ]}
      onDraftChange={() => undefined}
      onStepComplete={() => undefined}
      onFormContinueValidationFailed={() => undefined}
    />
  ),
}
