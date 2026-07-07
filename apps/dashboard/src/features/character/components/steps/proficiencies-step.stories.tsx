import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  buildCharacterPreview,
  createEmptyCharacterBuilderDraft,
  indexCharacterBuildCatalog,
  resolveAvailableChoices,
} from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from '../../lib/character-builder-fixtures'
import {
  createEmptyProficienciesStepPreviewFixture,
  createProficienciesStepRogueContextFixture,
  proficienciesStepRogueClass,
} from '../../lib/proficiencies-step.fixtures'
import { ProficienciesStep } from './proficiencies-step.client'

const originLanguagesContext = createPopulatedStandaloneBuilderContextFixture()
const rogueContext = createProficienciesStepRogueContextFixture()

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
      context={originLanguagesContext}
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
    const draft = createEmptyCharacterBuilderDraft()
    const resolvedChoiceSets = resolveAvailableChoices(draft, originLanguagesContext)
    const catalogIndex = indexCharacterBuildCatalog(originLanguagesContext.catalog)
    const preview = buildCharacterPreview(
      draft,
      catalogIndex,
      originLanguagesContext.characterCreationRules,
      originLanguagesContext.rulesetId,
      { resolvedChoiceSets },
    )

    return (
      <ProficienciesStep
        context={originLanguagesContext}
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
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: proficienciesStepRogueClass.id, level: 1 as const },
    }
    const resolvedChoiceSets = resolveAvailableChoices(draft, rogueContext)
    const catalogIndex = indexCharacterBuildCatalog(rogueContext.catalog)
    const preview = buildCharacterPreview(
      draft,
      catalogIndex,
      rogueContext.characterCreationRules,
      rogueContext.rulesetId,
      { resolvedChoiceSets },
    )

    return (
      <ProficienciesStep
        context={rogueContext}
        draft={draft}
        preview={preview}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />
    )
  },
}
