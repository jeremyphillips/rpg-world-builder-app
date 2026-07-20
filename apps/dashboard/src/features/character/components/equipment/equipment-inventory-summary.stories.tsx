import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import {
  buildChoiceSetId,
  buildStartingPackageConversionPreview,
  createEmptyCharacterBuilderDraft,
  resolveStartingEquipmentFundingOptions,
  startingEquipmentChoiceSetId,
} from '@rpg/contracts'

import {
  equipmentStepCatalogIndexFixture,
  equipmentStepContextFixture,
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
      [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard-equipment'],
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

const inventoryManagementArgs = {
  context: equipmentStepContextFixture,
  onReleaseGrant: () => undefined,
  onRemovePurchase: () => undefined,
  onAddAnother: () => undefined,
} as const

const meta = {
  title: 'Character Builder/EquipmentInventorySummary',
  component: EquipmentInventorySummary,
  parameters: { layout: 'padded' },
  args: {
    draft: monkStandardDraft(),
    catalogIndex: equipmentStepCatalogIndexFixture,
    ...inventoryManagementArgs,
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
  const goldOptionFunding = resolveStartingEquipmentFundingOptions({
    draft,
    catalogIndex: equipmentStepCatalogIndexFixture,
  }).get('starting-gold')!
  const preview = buildStartingPackageConversionPreview({
    draft,
    catalogIndex: equipmentStepCatalogIndexFixture,
    departingOptionId: 'standard-equipment',
    targetFunding: goldOptionFunding,
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
        goldOptionFunding={goldOptionFunding}
        conversionEditorOpen
        selectedPackageItemKeys={selectedPackageItemKeys}
        onSelectedPackageItemKeysChange={(keys) => setSelectedPackageItemKeys(new Set(keys))}
        onCustomizePackage={() => undefined}
        onChangeEquipmentOption={() => undefined}
        onCancelConversion={() => undefined}
        onCommitConversion={() => undefined}
        {...inventoryManagementArgs}
      />
    )
  }

  return (
    <EquipmentInventorySummary
      draft={draft}
      catalogIndex={equipmentStepCatalogIndexFixture}
      goldOptionFunding={goldOptionFunding}
      conversionEditorOpen
      selectedPackageItemKeys={selectedPackageItemKeys}
      onSelectedPackageItemKeysChange={(keys) => setSelectedPackageItemKeys(new Set(keys))}
      onCustomizePackage={() => undefined}
      onChangeEquipmentOption={() => undefined}
      onCancelConversion={() => undefined}
      onCommitConversion={() => undefined}
      {...inventoryManagementArgs}
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
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard-equipment'],
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
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['starting-gold'],
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

const torchFixture = {
  id: 'srd-cc-5.2.1:torch',
  slug: 'torch',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Torch',
  description: '',
  cost: { amount: 1, currency: 'cp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'general',
  bundleSize: 1,
} as const

const monkWithTorchGrantCatalog = {
  ...equipmentStepCatalogIndexFixture,
  equipment: new Map([
    ...equipmentStepCatalogIndexFixture.equipment,
    [torchFixture.id, torchFixture],
  ]),
  classes: new Map([
    ...equipmentStepCatalogIndexFixture.classes,
    [
      equipmentStepMonkClassFixture.id,
      {
        ...equipmentStepMonkClassFixture,
        characterCreation: {
          ...equipmentStepMonkClassFixture.characterCreation!,
          startingEquipment: {
            choose: 1,
            options: [
              {
                id: 'standard-equipment',
                label: 'Standard Equipment',
                items: [
                  {
                    kind: 'grant',
                    target: { source: 'equipment', equipmentSlug: 'torch' },
                    quantity: 2,
                  },
                ],
                wealth: { gp: 11 },
              },
              {
                id: 'starting-gold',
                label: 'Starting Gold',
                items: [],
                wealth: { gp: 50 },
              },
            ],
          },
        },
      },
    ],
  ]),
}

export const PackageConversionSameOriginMerge: Story = {
  args: {
    draft: {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [
          {
            id: 'picker-torch',
            equipmentId: torchFixture.id,
            quantity: 3,
            sourceMode: 'startingGold',
            origin: 'picker',
          },
        ],
        removedPackageItemKeys: [],
        customized: false,
      },
    },
    catalogIndex: monkWithTorchGrantCatalog,
    conversionEditorOpen: true,
    selectedPackageItemKeys: new Set([`${equipmentStepMonkClassFixture.id}:standard-equipment:0`]),
  },
}

const packageOnlyClassCatalog = {
  ...equipmentStepCatalogIndexFixture,
  classes: new Map([
    ...equipmentStepCatalogIndexFixture.classes,
    [
      equipmentStepMonkClassFixture.id,
      {
        ...equipmentStepMonkClassFixture,
        characterCreation: {
          ...equipmentStepMonkClassFixture.characterCreation!,
          startingEquipment: {
            choose: 1,
            options: [
              {
                id: 'standard-equipment',
                label: 'Standard Equipment',
                items: [
                  {
                    kind: 'grant',
                    target: { source: 'equipment', equipmentSlug: 'spear' },
                    quantity: 1,
                  },
                ],
                wealth: { gp: 11 },
              },
            ],
          },
        },
      },
    ],
  ]),
}

export const PackageWithInvalidItem: Story = {
  args: {
    draft: monkStandardDraft(),
    catalogIndex: packageOnlyClassCatalog,
  },
}
