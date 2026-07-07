import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  createEmptyCharacterBuilderDraft,
  DEFAULT_ABILITY_GENERATION_RULES,
  indexCharacterBuildCatalog,
  type CharacterBuilderStepId,
  type CharacterBuildValidationIssue,
} from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from '../lib/character-builder-fixtures'
import { CharacterBuilderStepRail } from './character-builder-step-rail.client'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = indexCharacterBuildCatalog(context.catalog)
const standardArray = DEFAULT_ABILITY_GENERATION_RULES.standardArray

const railProps = {
  context,
  catalogIndex,
  resolvedChoiceSets: null,
  validationIssues: [] as CharacterBuildValidationIssue[],
  draftValidationIssues: [] as CharacterBuildValidationIssue[],
  attemptedStepIds: [] as CharacterBuilderStepId[],
  standardArray,
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

export const IdentityWarning: Story = {
  render: () => (
    <CharacterBuilderStepRail
      draft={createEmptyCharacterBuilderDraft()}
      currentStepId="identity"
      {...railProps}
      validationIssues={[
        { code: 'identity.name.required', message: 'Name is required.', stepId: 'identity' },
      ]}
      attemptedStepIds={['identity']}
    />
  ),
}

export const IssuesBeforeAttempt: Story = {
  render: () => (
    <CharacterBuilderStepRail
      draft={createEmptyCharacterBuilderDraft()}
      currentStepId="identity"
      {...railProps}
      validationIssues={[
        { code: 'identity.name.required', message: 'Name is required.', stepId: 'identity' },
      ]}
    />
  ),
}

export const TouchedStepDraftWarning: Story = {
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
