import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  createEmptyCharacterBuilderDraft,
  DEFAULT_ABILITY_GENERATION_RULES,
  indexCharacterBuildCatalog,
} from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from '../lib/character-builder-fixtures'
import { CharacterBuilderStepRail } from './character-builder-step-rail.client'

const catalogIndex = indexCharacterBuildCatalog(
  createPopulatedStandaloneBuilderContextFixture().catalog,
)
const standardArray = DEFAULT_ABILITY_GENERATION_RULES.standardArray

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
      catalogIndex={catalogIndex}
      resolvedChoiceSets={null}
      validationIssues={[]}
      attemptedStepIds={[]}
      standardArray={standardArray}
      onStepSelect={() => undefined}
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
      catalogIndex={catalogIndex}
      resolvedChoiceSets={null}
      validationIssues={[]}
      attemptedStepIds={[]}
      standardArray={standardArray}
      onStepSelect={() => undefined}
    />
  ),
}

export const IdentityWarning: Story = {
  render: () => (
    <CharacterBuilderStepRail
      draft={createEmptyCharacterBuilderDraft()}
      currentStepId="identity"
      catalogIndex={catalogIndex}
      resolvedChoiceSets={null}
      validationIssues={[
        { code: 'identity.name.required', message: 'Name is required.', stepId: 'identity' },
      ]}
      attemptedStepIds={['identity']}
      standardArray={standardArray}
      onStepSelect={() => undefined}
    />
  ),
}
