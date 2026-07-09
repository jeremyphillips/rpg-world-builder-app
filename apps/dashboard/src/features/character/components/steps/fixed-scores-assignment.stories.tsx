import type { Meta, StoryObj } from '@storybook/react-vite'

import { STANDARD_ARRAY } from '@rpg/contracts'
import { Form } from '@rpg/ui/form'

import { abilitiesFormSchema } from '../../lib/steps/abilities-form-fields'
import { FixedScoresAssignment } from './fixed-scores-assignment.client'

const meta = {
  title: 'Character Builder/FixedScoresAssignment',
  component: FixedScoresAssignment,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Form
        schema={abilitiesFormSchema}
        fields={[{ kind: 'slot', name: 'fixedScoresAssignment', render: () => <Story /> }]}
        defaultValues={{}}
        onSubmit={() => undefined}
      />
    ),
  ],
} satisfies Meta<typeof FixedScoresAssignment>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    scorePool: [...STANDARD_ARRAY],
    showInvalidStates: false,
  },
}

export const PartialAssignment: Story = {
  args: {
    scorePool: [...STANDARD_ARRAY],
    showInvalidStates: false,
  },
  decorators: [
    (Story) => (
      <Form
        schema={abilitiesFormSchema}
        fields={[{ kind: 'slot', name: 'fixedScoresAssignment', render: () => <Story /> }]}
        defaultValues={{ str: 15, con: 13 }}
        onSubmit={() => undefined}
      />
    ),
  ],
}

export const CompleteAssignment: Story = {
  args: {
    scorePool: [...STANDARD_ARRAY],
    showInvalidStates: false,
  },
  decorators: [
    (Story) => (
      <Form
        schema={abilitiesFormSchema}
        fields={[{ kind: 'slot', name: 'fixedScoresAssignment', render: () => <Story /> }]}
        defaultValues={{ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 }}
        onSubmit={() => undefined}
      />
    ),
  ],
}

export const InvalidAfterAttempt: Story = {
  args: {
    scorePool: [...STANDARD_ARRAY],
    showInvalidStates: true,
  },
}
