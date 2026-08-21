import type { Meta, StoryObj } from '@storybook/react-vite'

import { DEFAULT_STANDARD_ARRAY } from '@rpg/contracts'
import { Form } from '@rpg/ui/form'

import { abilitiesFormSchema } from '../../../../../lib/steps/abilities-form-fields'
import { FixedScoresAssignment } from './fixed-scores-assignment'

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

const fighterClassInput = {
  className: 'Fighter',
  primaryAbilities: ['str', 'dex'] as const,
}

const fighterRecommendation = {
  primary: ['str'] as const,
  secondary: ['dex'] as const,
  suggestedAssignment: { str: 15, dex: 14 },
}

export const Empty: Story = {
  args: {
    scorePool: [...DEFAULT_STANDARD_ARRAY],
    showInvalidStates: false,
  },
}

export const PartialAssignment: Story = {
  args: {
    scorePool: [...DEFAULT_STANDARD_ARRAY],
    showInvalidStates: false,
    classInput: fighterClassInput,
    recommendation: fighterRecommendation,
  },
  decorators: [
    (Story) => (
      <Form
        schema={abilitiesFormSchema}
        fields={[{ kind: 'slot', name: 'fixedScoresAssignment', render: () => <Story /> }]}
        defaultValues={{ con: 15 }}
        onSubmit={() => undefined}
      />
    ),
  ],
}

export const CompleteAssignment: Story = {
  args: {
    scorePool: [...DEFAULT_STANDARD_ARRAY],
    showInvalidStates: false,
    classInput: fighterClassInput,
    recommendation: fighterRecommendation,
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
    scorePool: [...DEFAULT_STANDARD_ARRAY],
    showInvalidStates: true,
  },
}
