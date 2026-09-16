import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  buildCharacterPreview,
  createEmptyCharacterBuilderDraft,
  resolveAvailableChoices,
} from '@rpg/contracts'

import {
  createStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../../../lib/fixtures/character-builder-fixtures'
import { CharacterBuilderPreviewRail } from './character-builder-preview-rail'

const context = createStandaloneBuilderContextFixture()
const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)
const draft = createEmptyCharacterBuilderDraft()
const resolvedChoiceSets = resolveAvailableChoices(draft, context)
const preview = buildCharacterPreview(
  draft,
  catalogIndex,
  context.characterCreationRules,
  context.rulesetId,
  { resolvedChoiceSets },
)

const defaultArgs = {
  draft,
  context,
  catalogIndex,
  preview,
  resolvedChoiceSets,
  currentStepId: 'identity' as const,
  canCreateCharacter: false,
  validationVisibleStepIds: [] as const,
  validationIssues: [] as const,
}

const meta = {
  title: 'Character Builder/CharacterBuilderPreviewRail',
  component: CharacterBuilderPreviewRail,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CharacterBuilderPreviewRail>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: defaultArgs,
  render: (args) => (
    <div className="flex h-[40rem] flex-col overflow-hidden bg-background p-8">
      <div className="hidden min-h-0 flex-1 xl:flex xl:flex-col">
        <CharacterBuilderPreviewRail {...args} />
      </div>
    </div>
  ),
}
