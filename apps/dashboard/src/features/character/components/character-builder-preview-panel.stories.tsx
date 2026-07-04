import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  buildCharacterPreview,
  createEmptyCharacterBuilderDraft,
  indexCharacterBuildCatalog,
} from '@rpg/contracts'

import { createStandaloneBuilderContextFixture } from '../lib/character-builder-fixtures'
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
  render: () => (
    <CharacterBuilderPreviewPanel
      preview={buildCharacterPreview(
        createEmptyCharacterBuilderDraft(),
        catalogIndex,
        context.characterCreationRules,
      )}
    />
  ),
}

export const PartialDraft: Story = {
  render: () => (
    <div className="max-w-xs">
      <CharacterBuilderPreviewPanel
        preview={buildCharacterPreview(
          {
            ...createEmptyCharacterBuilderDraft(),
            identity: { name: 'Verna', alignment: 'ng' },
            abilities: {
              method: 'manual',
              scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
            },
          },
          catalogIndex,
          context.characterCreationRules,
        )}
      />
    </div>
  ),
}
