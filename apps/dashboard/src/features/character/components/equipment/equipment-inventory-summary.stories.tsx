import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import {
  buildChoiceSetId,
  buildStartingPackageConversionPreview,
  createEmptyCharacterBuilderDraft,
  startingEquipmentChoiceSetId,
} from '@rpg/contracts'

import {
  equipmentStepCatalogIndexFixture,
  equipmentStepLuteFixture,
  equipmentStepMonkClassFixture,
} from '../../lib/equipment-step.fixtures'
import { EquipmentInventorySummary } from './equipment-inventory-summary.client'

const monkToolChoiceSetId = buildChoiceSetId(
  'class',
  equipmentStepMonkClassFixture.id,
  'class-tools',
)

function monkStandardDraft(extra?: {
  purchases?: Array<{
    equipmentId: string
    quantity: number
    sourceMode: 'startingGold'
    origin?: 'picker'
  }>
}) {
  return {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
    choiceSelections: {
      [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard'],
      [monkToolChoiceSetId]: [equipmentStepLuteFixture.id],
    },
    equipment: {
      mode: 'package' as const,
      purchases: extra?.purchases ?? [],
      removedPackageItemKeys: [],
      customized: false,
    },
  }
}

const meta = {
  title: 'Character Builder/EquipmentInventorySummary',
  component: EquipmentInventorySummary,
  parameters: { layout: 'padded' },
  args: {
    draft: monkStandardDraft(),
    catalogIndex: equipmentStepCatalogIndexFixture,
  },
} satisfies Meta<typeof EquipmentInventorySummary>

export default meta
type Story = StoryObj<typeof meta>

export const StandardPackageOnly: Story = {
  args: {
    draft: monkStandardDraft(),
    catalogIndex: equipmentStepCatalogIndexFixture,
  },
}

export const StandardPackageWithPurchases: Story = {
  args: {
    draft: monkStandardDraft({
      purchases: [
        {
          equipmentId: 'srd-cc-5.2.1:rations',
          quantity: 2,
          sourceMode: 'startingGold',
          origin: 'picker',
        },
      ],
    }),
    catalogIndex: equipmentStepCatalogIndexFixture,
  },
}

function PackageCustomizationStory({ overBudget = false }: { overBudget?: boolean }) {
  const draft = monkStandardDraft()
  const preview = buildStartingPackageConversionPreview({
    draft,
    catalogIndex: equipmentStepCatalogIndexFixture,
    departingOptionId: 'standard',
    selectedPackageItemKeys: new Set(),
  })

  const initialSelection = new Set(
    preview?.items
      .filter((item) => item.status === 'selectable')
      .map((item) => item.packageItemKey) ?? [],
  )

  const [selectedPackageItemKeys, setSelectedPackageItemKeys] = useState(initialSelection)

  if (overBudget) {
    return (
      <EquipmentInventorySummary
        draft={draft}
        catalogIndex={equipmentStepCatalogIndexFixture}
        conversionEditorOpen
        selectedPackageItemKeys={selectedPackageItemKeys}
        onSelectedPackageItemKeysChange={(keys) => setSelectedPackageItemKeys(new Set(keys))}
        onCustomizePackage={() => undefined}
        onChangeEquipmentOption={() => undefined}
        onRemoveFromPackage={() => undefined}
        onCancelConversion={() => undefined}
        onCommitConversion={() => undefined}
      />
    )
  }

  return (
    <EquipmentInventorySummary
      draft={draft}
      catalogIndex={equipmentStepCatalogIndexFixture}
      conversionEditorOpen
      selectedPackageItemKeys={selectedPackageItemKeys}
      onSelectedPackageItemKeysChange={(keys) => setSelectedPackageItemKeys(new Set(keys))}
      onCustomizePackage={() => undefined}
      onChangeEquipmentOption={() => undefined}
      onRemoveFromPackage={() => undefined}
      onCancelConversion={() => undefined}
      onCommitConversion={() => undefined}
    />
  )
}

export const PackageCustomizationOpen: Story = {
  render: () => <PackageCustomizationStory />,
}

export const PackageCustomizationOverBudget: Story = {
  render: () => <PackageCustomizationStory overBudget />,
}

export const PackageWithLinkedProficiencyItem: Story = {
  args: {
    draft: {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    },
    catalogIndex: equipmentStepCatalogIndexFixture,
    conversionEditorOpen: true,
    selectedPackageItemKeys: new Set(),
  },
}

export const GoldPurchasesWithStackableQuantities: Story = {
  args: {
    draft: {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [
          {
            equipmentId: 'srd-cc-5.2.1:rations',
            quantity: 2,
            sourceMode: 'startingGold',
            origin: 'picker',
          },
        ],
        removedPackageItemKeys: [],
        customized: false,
      },
    },
    catalogIndex: equipmentStepCatalogIndexFixture,
  },
}
