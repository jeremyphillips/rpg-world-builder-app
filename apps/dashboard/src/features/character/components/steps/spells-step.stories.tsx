import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  buildCharacterPreview,
  createEmptyCharacterBuilderDraft,
  indexCharacterBuildCatalog,
  resolveAvailableChoices,
} from '@rpg/contracts'

import {
  createSpellsStepContextFixture,
  spellsStepWizardClass,
} from '../../lib/spells/spells-step.fixtures'
import { SpellsStep } from './spells-step.client'

const context = createSpellsStepContextFixture()

const meta = {
  title: 'Character Builder/SpellsStep',
  component: SpellsStep,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SpellsStep>

export default meta
type Story = StoryObj<typeof SpellsStep>

export const NonCaster: Story = {
  render: () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
    }

    return (
      <SpellsStep
        context={context}
        draft={draft}
        preview={null}
        resolvedChoiceSets={resolveAvailableChoices(draft, context)}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />
    )
  },
}

export const NoClass: Story = {
  render: () => {
    const draft = createEmptyCharacterBuilderDraft()

    return (
      <SpellsStep
        context={context}
        draft={draft}
        preview={null}
        resolvedChoiceSets={resolveAvailableChoices(draft, context)}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />
    )
  },
}

export const Wizard: Story = {
  render: () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: spellsStepWizardClass.id, level: 1 as const },
      abilities: {
        method: 'standard-array' as const,
        scores: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
      },
    }

    const resolvedChoiceSets = resolveAvailableChoices(draft, context)
    const catalogIndex = indexCharacterBuildCatalog(context.catalog)

    return (
      <SpellsStep
        context={context}
        draft={draft}
        preview={buildCharacterPreview(
          draft,
          catalogIndex,
          context.characterCreationRules,
          context.rulesetId,
          { resolvedChoiceSets },
        )}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />
    )
  },
}
