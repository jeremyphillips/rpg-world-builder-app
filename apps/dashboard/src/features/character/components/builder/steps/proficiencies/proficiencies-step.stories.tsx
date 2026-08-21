import type { Meta, StoryObj } from '@storybook/react-vite'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import {
  createEmptyProficienciesStepPreviewFixture,
  createProficienciesStepOriginLanguagesFixture,
  createProficienciesStepRogueFixture,
  createProficienciesStepRogueWithSkillSelectionsFixture,
  createProficienciesStepRogueWithStaleSkillFixture,
} from '../../../../lib/proficiencies/proficiencies-step.fixtures'
import { createStandaloneBuilderContextFixture } from '../../../../lib/fixtures/character-builder-fixtures'
import { ProficienciesStep } from './proficiencies-step.client'

const emptyContext = createStandaloneBuilderContextFixture()

const meta = {
  title: 'Character Builder/ProficienciesStep',
  component: ProficienciesStep,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProficienciesStep>

export default meta
type Story = StoryObj<typeof ProficienciesStep>

export const Empty: Story = {
  render: () => (
    <ProficienciesStep
      context={emptyContext}
      draft={createEmptyCharacterBuilderDraft()}
      preview={createEmptyProficienciesStepPreviewFixture()}
      resolvedChoiceSets={[]}
      validationIssues={[]}
      onDraftChange={() => undefined}
    />
  ),
}

export const OriginLanguages: Story = {
  render: () => {
    const { context, draft, preview, resolvedChoiceSets } =
      createProficienciesStepOriginLanguagesFixture()

    return (
      <ProficienciesStep
        context={context}
        draft={draft}
        preview={preview}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />
    )
  },
}

export const Rogue: Story = {
  render: () => {
    const { context, draft, preview, resolvedChoiceSets } = createProficienciesStepRogueFixture()

    return (
      <ProficienciesStep
        context={context}
        draft={draft}
        preview={preview}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />
    )
  },
}

export const RogueWithSelections: Story = {
  render: () => {
    const { context, draft, preview, resolvedChoiceSets } =
      createProficienciesStepRogueWithSkillSelectionsFixture()

    return (
      <ProficienciesStep
        context={context}
        draft={draft}
        preview={preview}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />
    )
  },
}

export const RogueStaleSelection: Story = {
  render: () => {
    const { context, draft, preview, resolvedChoiceSets } =
      createProficienciesStepRogueWithStaleSkillFixture()

    return (
      <ProficienciesStep
        context={context}
        draft={draft}
        preview={preview}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />
    )
  },
}
