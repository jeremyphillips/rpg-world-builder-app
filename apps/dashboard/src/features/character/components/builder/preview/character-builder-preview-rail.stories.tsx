import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  buildCharacterPreview,
  createEmptyCharacterBuilderDraft,
  resolveAvailableChoices,
} from '@rpg/contracts'

import { pickClass } from '@/features/content'
import { pickEquipment } from '@/test/fixtures/pick'

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

const fighter = pickClass('fighter')
const rope = pickEquipment('rope')
const pendingContext = createStandaloneBuilderContextFixture({
  catalog: { ...context.catalog, classes: [fighter], equipment: [rope] },
})
const pendingCatalogIndex = createStandaloneBuilderCatalogIndexFixture(pendingContext)
const pendingDraft = {
  ...createEmptyCharacterBuilderDraft(),
  class: { classId: fighter.id, level: 1 as const },
  equipment: {
    mode: 'package' as const,
    purchases: [
      {
        equipmentId: rope.id,
        quantity: 1,
        sourceMode: 'startingGold' as const,
        origin: 'picker' as const,
      },
    ],
    classPackage: { state: 'unresolved' as const },
    editedSincePackageSelection: false,
  },
}
const pendingChoiceSets = resolveAvailableChoices(pendingDraft, pendingContext)

export const PendingStartingEquipment: Story = {
  args: {
    ...defaultArgs,
    draft: pendingDraft,
    context: pendingContext,
    catalogIndex: pendingCatalogIndex,
    resolvedChoiceSets: pendingChoiceSets,
    preview: buildCharacterPreview(
      pendingDraft,
      pendingCatalogIndex,
      pendingContext.characterCreationRules,
      pendingContext.rulesetId,
      { resolvedChoiceSets: pendingChoiceSets },
    ),
    currentStepId: 'equipment',
  },
  render: Default.render,
}
