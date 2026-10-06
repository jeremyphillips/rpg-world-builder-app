import type { Meta, StoryObj } from '@storybook/react-vite'

import { buildEquipmentInventoryViewModel } from '../../../../lib/equipment/equipment-inventory-summary.lib'
import {
  selectionFactsDraft,
  selectionFactsForDraft,
  selectionFactsPurchase,
  selectionFactsScenario,
} from '../../../../lib/equipment/equipment-selection-facts.fixtures'
import { EquipmentAddedInventorySection } from './equipment-added-inventory-section'

const scenario = selectionFactsScenario()
const draft = selectionFactsDraft({
  optionId: 'starting-gold',
  purchases: [
    selectionFactsPurchase('plate-armor'),
    selectionFactsPurchase('greataxe'),
    selectionFactsPurchase('dagger'),
  ],
})
const addedEquipment =
  buildEquipmentInventoryViewModel(
    draft,
    scenario.catalogIndex,
    undefined,
    'included',
    scenario.context,
    selectionFactsForDraft(scenario, draft),
  )?.addedEquipment ?? []

const meta = {
  title: 'Character Builder/EquipmentAddedInventorySection',
  component: EquipmentAddedInventorySection,
  parameters: { layout: 'padded' },
  args: {
    addedEquipment,
    draft,
    context: scenario.context,
    catalogIndex: scenario.catalogIndex,
    onReleaseGrant: () => undefined,
    onRemovePurchase: () => undefined,
    onApplyMagicItemAcquisition: () => false,
  },
} satisfies Meta<typeof EquipmentAddedInventorySection>

export default meta
type Story = StoryObj<typeof meta>

/** STR 8 Wizard: owned rows resolve the `owned` context (compatibility only). */
export const OwnedCompatibilityStatus: Story = {}

export const Empty: Story = {
  args: { addedEquipment: [] },
}
