import type { Meta, StoryObj } from '@storybook/react-vite'

import { createEmptyCharacterBuilderDraft, indexCharacterBuildCatalog } from '@rpg/contracts'
import type {
  CharacterBuilderStepId,
  CharacterBuildValidationIssue,
} from '@rpg/contracts/rpg/character-builder'

import { createPopulatedStandaloneBuilderContextFixture } from '../../../lib/fixtures/character-builder-fixtures'
import { CharacterBuilderStepRail } from './character-builder-step-rail'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = indexCharacterBuildCatalog(context.catalog)

const railProps = {
  context,
  catalogIndex,
  resolvedChoiceSets: null,
  draftValidationIssues: [] as CharacterBuildValidationIssue[],
  validationVisibleStepIds: [] as CharacterBuilderStepId[],
  onStepSelect: () => undefined,
}

const meta = {
  title: 'Character Builder/CharacterBuilderStepRail',
  component: CharacterBuilderStepRail,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CharacterBuilderStepRail>

export default meta
type Story = StoryObj<typeof CharacterBuilderStepRail>

export const IdentityActive: Story = {
  render: () => (
    <CharacterBuilderStepRail
      draft={createEmptyCharacterBuilderDraft()}
      currentStepId="identity"
      {...railProps}
    />
  ),
}

export const AbilitiesActive: Story = {
  render: () => (
    <CharacterBuilderStepRail
      draft={{
        ...createEmptyCharacterBuilderDraft(),
        identity: { name: 'Verna', alignment: 'ng' },
        species: { speciesId: 'srd-cc-5.2.1:dwarf' },
        class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
        touchedStepIds: ['identity', 'species', 'class'],
      }}
      currentStepId="abilities"
      {...railProps}
    />
  ),
}

export const IdentityValidationVisible: Story = {
  render: () => (
    <CharacterBuilderStepRail
      draft={createEmptyCharacterBuilderDraft()}
      currentStepId="species"
      {...railProps}
      validationVisibleStepIds={['identity']}
    />
  ),
}

export const DraftIssuesBeforeValidationVisible: Story = {
  render: () => (
    <CharacterBuilderStepRail
      draft={{
        ...createEmptyCharacterBuilderDraft(),
        touchedStepIds: ['identity'],
      }}
      currentStepId="species"
      {...railProps}
      draftValidationIssues={[
        { code: 'name_required', message: 'Enter a character name.', stepId: 'identity' },
      ]}
    />
  ),
}
