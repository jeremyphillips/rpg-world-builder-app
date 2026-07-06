import type { Meta, StoryObj } from '@storybook/react-vite'

import { createEmptyCharacterBuilderDraft, STANDARD_ARRAY } from '@rpg/contracts'

import { createStandaloneBuilderContextFixture } from '../../lib/character-builder-fixtures'
import { AbilitiesStep } from './abilities-step.client'

const context = createStandaloneBuilderContextFixture()
const manualContext = createStandaloneBuilderContextFixture({
  characterCreationRules: {
    ...context.characterCreationRules,
    abilityGeneration: {
      methods: ['manual'],
      standardArray: [...STANDARD_ARRAY],
    },
  },
})

const meta = {
  title: 'Character Builder/AbilitiesStep',
  component: AbilitiesStep,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof AbilitiesStep>

export default meta
type Story = StoryObj<typeof AbilitiesStep>

export const Empty: Story = {
  render: () => (
    <AbilitiesStep
      context={context}
      draft={createEmptyCharacterBuilderDraft()}
      validationIssues={[]}
      onDraftChange={() => undefined}
      onStepComplete={() => undefined}
    />
  ),
}

export const PartialAssignment: Story = {
  render: () => (
    <AbilitiesStep
      context={context}
      draft={{
        ...createEmptyCharacterBuilderDraft(),
        abilities: {
          method: 'standard-array',
          scores: { str: 15, con: 13 },
        },
      }}
      validationIssues={[]}
      onDraftChange={() => undefined}
      onStepComplete={() => undefined}
    />
  ),
}

export const CompleteAssignment: Story = {
  render: () => (
    <AbilitiesStep
      context={context}
      draft={{
        ...createEmptyCharacterBuilderDraft(),
        abilities: {
          method: 'standard-array',
          scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
        },
      }}
      validationIssues={[]}
      onDraftChange={() => undefined}
      onStepComplete={() => undefined}
    />
  ),
}

export const WithValidationIssues: Story = {
  render: () => (
    <AbilitiesStep
      context={context}
      draft={createEmptyCharacterBuilderDraft()}
      validationIssues={[
        {
          code: 'abilities_incomplete',
          message: 'Assign a score to every ability.',
          path: 'abilities.scores',
          stepId: 'abilities',
        },
      ]}
      onDraftChange={() => undefined}
      onStepComplete={() => undefined}
    />
  ),
}

export const ManualEntry: Story = {
  render: () => (
    <AbilitiesStep
      context={manualContext}
      draft={createEmptyCharacterBuilderDraft()}
      validationIssues={[]}
      onDraftChange={() => undefined}
      onStepComplete={() => undefined}
    />
  ),
}
