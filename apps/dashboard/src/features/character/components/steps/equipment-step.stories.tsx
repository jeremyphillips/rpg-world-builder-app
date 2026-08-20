import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  buildChoiceSetId,
  createEmptyCharacterBuilderDraft,
  resolveAvailableChoices,
  startingEquipmentChoiceSetId,
} from '@rpg/contracts'

import { createStandaloneBuilderContextFixture } from '../../lib/fixtures/character-builder-fixtures'
import {
  equipmentStepBardClassFixture,
  equipmentStepCatalogFixture,
  equipmentStepLuteFixture,
  equipmentStepMonkClassFixture,
} from '../../lib/equipment/equipment-step.fixtures'
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

export const NoClass: Story = {
  render: () => (
    <EquipmentStep
      context={context}
      draft={createEmptyCharacterBuilderDraft()}
      resolvedChoiceSets={[]}
      validationIssues={[]}
      onDraftChange={() => undefined}
    />
  ),
}

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
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['starting-gold'],
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

const monkToolChoiceSetId = buildChoiceSetId(
  'class',
  equipmentStepMonkClassFixture.id,
  'class-tools',
)

export const MonkLinkedGrantPending: Story = {
  render: () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard-equipment'],
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

export const MonkLinkedGrantResolved: Story = {
  render: () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard-equipment'],
        [monkToolChoiceSetId]: [equipmentStepLuteFixture.id],
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

export const MagicItemGrants: Story = {
  render: () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 2 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['starting-gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
        magicItemSelections: [],
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
