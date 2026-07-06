import type { Meta, StoryObj } from '@storybook/react-vite'

import { createEmptyCharacterBuilderDraft, resolveAvailableChoices } from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from '../../lib/character-builder-fixtures'
import { ProficienciesStep } from './proficiencies-step.client'

const context = createPopulatedStandaloneBuilderContextFixture()

const meta = {
  title: 'Character Builder/ProficienciesStep',
  component: ProficienciesStep,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProficienciesStep>

export default meta
type Story = StoryObj<typeof ProficienciesStep>

export const OriginLanguages: Story = {
  render: () => {
    const draft = createEmptyCharacterBuilderDraft()

    return (
      <ProficienciesStep
        draft={draft}
        resolvedChoiceSets={resolveAvailableChoices(draft, context)}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />
    )
  },
}
