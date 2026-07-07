import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  createEmptyCharacterBuilderDraft,
  resolveAvailableChoices,
  startingEquipmentChoiceSetId,
} from '@rpg/contracts'

import { createStandaloneBuilderContextFixture } from '../../lib/character-builder-fixtures'
import {
  equipmentStepBardClassFixture,
  equipmentStepCatalogFixture,
} from '../../lib/equipment-step.fixtures'
import { EquipmentStep } from './equipment-step.client'

const context = createStandaloneBuilderContextFixture({
  catalog: equipmentStepCatalogFixture,
})

const meta = {
  title: 'Character Builder/EquipmentStep',
  component: EquipmentStep,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EquipmentStep>

export default meta
type Story = StoryObj<typeof EquipmentStep>

export const BardStartingEquipment: Story = {
  render: () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
    }

    return (
      <EquipmentStep
        context={context}
        draft={draft}
        resolvedChoiceSets={resolveAvailableChoices(draft, context)}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />
    )
  },
}

export const GoldShopping: Story = {
  render: () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    return (
      <EquipmentStep
        context={context}
        draft={draft}
        resolvedChoiceSets={resolveAvailableChoices(draft, context)}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />
    )
  },
}
