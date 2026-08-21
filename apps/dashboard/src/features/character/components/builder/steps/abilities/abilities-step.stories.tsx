import type { Meta, StoryObj } from '@storybook/react-vite'

import { createEmptyCharacterBuilderDraft, DEFAULT_STANDARD_ARRAY } from '@rpg/contracts'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderContextFixture,
} from '../../../../lib/fixtures/character-builder-fixtures'
import { AbilitiesStep } from './abilities-step'

const context = createStandaloneBuilderContextFixture()
const populatedContext = createPopulatedStandaloneBuilderContextFixture()
const manualContext = createStandaloneBuilderContextFixture({
  characterCreationRules: {
    ...context.characterCreationRules,
    abilityGeneration: {
      methods: ['manual'],
      standardArray: [...DEFAULT_STANDARD_ARRAY],
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
      onFormContinueValidationFailed={() => undefined}
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
      onFormContinueValidationFailed={() => undefined}
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
      onFormContinueValidationFailed={() => undefined}
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
      onFormContinueValidationFailed={() => undefined}
    />
  ),
}

export const FighterRecommended: Story = {
  render: () => (
    <AbilitiesStep
      context={populatedContext}
      draft={{
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
      }}
      validationIssues={[]}
      onDraftChange={() => undefined}
      onStepComplete={() => undefined}
      onFormContinueValidationFailed={() => undefined}
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
      onFormContinueValidationFailed={() => undefined}
    />
  ),
}

export const ManualEntryWithClass: Story = {
  render: () => (
    <AbilitiesStep
      context={createPopulatedStandaloneBuilderContextFixture({
        characterCreationRules: manualContext.characterCreationRules,
      })}
      draft={{
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
      }}
      validationIssues={[]}
      onDraftChange={() => undefined}
      onStepComplete={() => undefined}
      onFormContinueValidationFailed={() => undefined}
    />
  ),
}
