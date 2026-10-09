import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import {
  buildStartingPackageConversionPreview,
  createEmptyCharacterBuilderDraft,
  resolveStartingEquipmentFundingOptions,
  startingEquipmentChoiceSetId,
} from '@rpg/contracts'

import {
  equipmentStepCatalogIndexFixture,
  equipmentStepMonkClassFixture,
} from '../../../lib/equipment/equipment-step.fixtures'
import { EQUIPMENT_PACKAGE_CUSTOMIZE_UNAVAILABLE_REASON } from '../../../lib/equipment/equipment-step.lib'
import { buildEquipmentInventoryViewModel } from '../../../lib/equipment/equipment-inventory-summary.lib'
import {
  selectionFactsDraft,
  selectionFactsEquipment,
  selectionFactsForDraft,
  selectionFactsScenario,
  selectionFactsUnpricedRobe,
  selectionFactsWizardPouchPackageClass,
} from '../../../lib/equipment/equipment-selection-facts.fixtures'
import { EquipmentSelectionFactsProvider } from '../selection-facts/equipment-selection-facts-provider'
import {
  EquipmentStartingPackageDisclosure,
  EquipmentStartingPackageGoldHeader,
  type EquipmentStartingPackageDisclosureProps,
} from './equipment-starting-package-disclosure'

function monkPackageDraft() {
  return {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
    choiceSelections: {
      [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard-equipment'],
    },
    equipment: {
      mode: 'package' as const,
      purchases: [],
      editedSincePackageSelection: false,
    },
  }
}

function disclosureArgs(
  overrides?: Partial<EquipmentStartingPackageDisclosureProps>,
): EquipmentStartingPackageDisclosureProps {
  const draft = monkPackageDraft()
  const viewModel = buildEquipmentInventoryViewModel(draft, equipmentStepCatalogIndexFixture)
  if (viewModel?.layout !== 'split' || viewModel.startingEquipment.kind !== 'package') {
    throw new Error('Expected a starting package channel')
  }

  const goldOptionFunding = resolveStartingEquipmentFundingOptions({
    draft,
    catalogIndex: equipmentStepCatalogIndexFixture,
  }).get('starting-gold')!

  const preview = buildStartingPackageConversionPreview({
    draft,
    catalogIndex: equipmentStepCatalogIndexFixture,
    departingOptionId: viewModel.startingEquipment.group.optionId,
    targetFunding: goldOptionFunding,
    selectedPackageItemKeys: new Set(),
  })

  return {
    packageGroup: viewModel.startingEquipment.group,
    draft,
    catalogIndex: equipmentStepCatalogIndexFixture,
    goldOptionFunding,
    conversionEditorOpen: false,
    selectedPackageItemKeys: new Set(
      preview?.items
        .filter((item) => item.status === 'selectable')
        .map((item) => item.packageItemKey) ?? [],
    ),
    onCustomize: () => undefined,
    onChangeEquipmentOption: () => undefined,
    onSelectedPackageItemKeysChange: () => undefined,
    onCancelConversion: () => undefined,
    onCommitConversion: () => undefined,
    ...overrides,
  }
}

const meta = {
  title: 'Character Builder/EquipmentStartingPackageDisclosure',
  component: EquipmentStartingPackageDisclosure,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-xl overflow-hidden rounded-lg border border-border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EquipmentStartingPackageDisclosure>

export default meta
type Story = StoryObj<typeof meta>

export const Collapsed: Story = {
  args: disclosureArgs(),
}

export const Expanded: Story = {
  args: disclosureArgs({ defaultExpanded: true }),
}

export const Customize: Story = {
  args: disclosureArgs({ conversionEditorOpen: true, defaultExpanded: true }),
  render: (args) => {
    const [selectedPackageItemKeys, setSelectedPackageItemKeys] = useState(
      args.selectedPackageItemKeys,
    )
    return (
      <EquipmentStartingPackageDisclosure
        {...args}
        selectedPackageItemKeys={selectedPackageItemKeys}
        onSelectedPackageItemKeysChange={(keys) => setSelectedPackageItemKeys(new Set(keys))}
      />
    )
  },
}

export const CustomizeDisabled: Story = {
  args: disclosureArgs({
    defaultExpanded: true,
    packageGroup: {
      ...disclosureArgs().packageGroup,
      customize: { status: 'disabled', reason: EQUIPMENT_PACKAGE_CUSTOMIZE_UNAVAILABLE_REASON },
    },
  }),
}

export const GoldOption: Story = {
  args: disclosureArgs(),
  render: () => <EquipmentStartingPackageGoldHeader optionLabel="Starting Gold" />,
}

const wizardConversionScenario = selectionFactsScenario({
  classes: [selectionFactsWizardPouchPackageClass],
  equipment: Object.values({ ...selectionFactsEquipment, robe: selectionFactsUnpricedRobe }),
})
const wizardConversionDraft = selectionFactsDraft({
  characterClass: selectionFactsWizardPouchPackageClass,
  optionId: 'standard-equipment',
})
const wizardConversionFacts = selectionFactsForDraft(
  wizardConversionScenario,
  wizardConversionDraft,
)

function wizardConversionArgs(): EquipmentStartingPackageDisclosureProps {
  const viewModel = buildEquipmentInventoryViewModel(
    wizardConversionDraft,
    wizardConversionScenario.catalogIndex,
    undefined,
    'included',
    wizardConversionScenario.context,
    wizardConversionFacts,
  )
  if (viewModel?.layout !== 'split' || viewModel.startingEquipment.kind !== 'package') {
    throw new Error('Expected a starting package channel')
  }
  return disclosureArgs({
    packageGroup: viewModel.startingEquipment.group,
    draft: wizardConversionDraft,
    catalogIndex: wizardConversionScenario.catalogIndex,
    goldOptionFunding: resolveStartingEquipmentFundingOptions({
      draft: wizardConversionDraft,
      catalogIndex: wizardConversionScenario.catalogIndex,
    }).get('starting-gold'),
    conversionEditorOpen: true,
    defaultExpanded: true,
    selectedPackageItemKeys: new Set(),
  })
}

/** Wizard conversion (edit_choice): requirement and recommendation guidance plus a conversion blocker. */
export const CustomizeSelectionStatus: Story = {
  args: wizardConversionArgs(),
  render: (args) => (
    <EquipmentSelectionFactsProvider facts={wizardConversionFacts}>
      <EquipmentStartingPackageDisclosure {...args} />
    </EquipmentSelectionFactsProvider>
  ),
}
