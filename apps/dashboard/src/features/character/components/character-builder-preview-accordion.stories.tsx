import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  buildCharacterPreview,
  createEmptyCharacterBuilderDraft,
  indexCharacterBuildCatalog,
  resolveAvailableChoices,
} from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from '../lib/character-builder-fixtures'
import { narrativeFieldCount } from '../lib/narrative-preview'
import { CharacterBuilderPreviewAccordion } from './character-builder-preview-accordion.client'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = indexCharacterBuildCatalog(context.catalog)

const meta = {
  title: 'Character Builder/CharacterBuilderPreviewAccordion',
  component: CharacterBuilderPreviewAccordion,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CharacterBuilderPreviewAccordion>

export default meta
type Story = StoryObj<typeof CharacterBuilderPreviewAccordion>

function renderAccordionStory(draft = createEmptyCharacterBuilderDraft()) {
  const resolvedChoiceSets = resolveAvailableChoices(draft, context)
  const preview = buildCharacterPreview(
    draft,
    catalogIndex,
    context.characterCreationRules,
    context.rulesetId,
    { resolvedChoiceSets },
  )
  const narrative = draft.identity.narrative
  const characterClass = draft.class.classId
    ? catalogIndex.classes.get(draft.class.classId)
    : undefined

  return (
    <div className="max-w-xs rounded-lg border border-border bg-surface-muted p-2">
      <CharacterBuilderPreviewAccordion
        preview={preview}
        catalogIndex={catalogIndex}
        draft={draft}
        resolvedChoiceSets={resolvedChoiceSets}
        narrative={narrative}
        narrativeCount={narrativeFieldCount(narrative)}
        hasCharacterClass={characterClass !== undefined}
        spellcastingActive={false}
      />
    </div>
  )
}

export const Empty: Story = {
  render: () => renderAccordionStory(),
}

export const WithNarrative: Story = {
  render: () =>
    renderAccordionStory({
      ...createEmptyCharacterBuilderDraft(),
      identity: {
        narrative: {
          personalityTraits: ['Steady under pressure.'],
          ideals: ['Protect the weak.'],
          backstory: '<p>A soldier turned adventurer.</p>',
        },
      },
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
      abilities: {
        method: 'manual',
        scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      },
    }),
}
