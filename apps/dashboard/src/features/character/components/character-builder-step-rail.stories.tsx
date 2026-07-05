import type { Meta, StoryObj } from '@storybook/react-vite'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { CharacterBuilderStepRail } from './character-builder-step-rail.client'

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
      resolvedChoiceSets={null}
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
      resolvedChoiceSets={null}
      onStepSelect={() => undefined}
    />
  ),
}
