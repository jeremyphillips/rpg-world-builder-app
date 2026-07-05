import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  buildCharacterPreview,
  createEmptyCharacterBuilderDraft,
  indexCharacterBuildCatalog,
} from '@rpg/contracts'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderContextFixture,
} from '../lib/character-builder-fixtures'
import { CharacterBuilderPreviewPanel } from './character-builder-preview-panel.client'

const meta = {
  title: 'Character Builder/CharacterBuilderPreviewPanel',
  component: CharacterBuilderPreviewPanel,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CharacterBuilderPreviewPanel>

export default meta
type Story = StoryObj<typeof CharacterBuilderPreviewPanel>

const context = createStandaloneBuilderContextFixture()
const catalogIndex = indexCharacterBuildCatalog(context.catalog)

export const EmptyDraft: Story = {
  render: () => {
    const draft = createEmptyCharacterBuilderDraft()
    return (
      <CharacterBuilderPreviewPanel
        draft={draft}
        context={context}
        catalogIndex={catalogIndex}
        preview={buildCharacterPreview(draft, catalogIndex, context.characterCreationRules)}
      />
    )
  },
}

export const PartialDraft: Story = {
  render: () => {
    const populatedContext = createPopulatedStandaloneBuilderContextFixture()
    const populatedCatalogIndex = indexCharacterBuildCatalog(populatedContext.catalog)
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: {
        name: 'Verna',
        alignment: 'ng' as const,
        narrative: {
          ideals: ['Protect the weak.'],
          backstory: '<p>A soldier turned adventurer.</p>',
        },
      },
      species: { speciesId: 'srd-cc-5.2.1:dwarf' },
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
      abilities: {
        method: 'manual' as const,
        scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      },
    }

    return (
      <div className="max-w-xs">
        <CharacterBuilderPreviewPanel
          draft={draft}
          context={populatedContext}
          catalogIndex={populatedCatalogIndex}
          preview={buildCharacterPreview(
            draft,
            populatedCatalogIndex,
            populatedContext.characterCreationRules,
          )}
        />
      </div>
    )
  },
}
