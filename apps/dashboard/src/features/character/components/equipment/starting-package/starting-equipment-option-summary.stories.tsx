import type { Meta, StoryObj } from '@storybook/react-vite'

import type { StartingEquipmentOptionSummary } from '@rpg/contracts'
import { SelectionOptionCardHeaderAction, SelectionOptionCardTitleMeta } from '@rpg/ui'

import { QuickNpcPackageCustomizationPanel } from '../../../npc/components/quick-npc/quick-npc-package-customization-panel'
import { EQUIPMENT_CHANGE_PACKAGE_LABEL } from '../../../lib/equipment/equipment-step.lib'

import { StartingEquipmentOptionSummaryCard } from './starting-equipment-option-summary'

const goldSummary = {
  optionId: 'starting-gold',
  label: 'Starting Gold',
  description: 'Take 155 GP instead of standard equipment.',
  orderedItems: [],
  itemsByGroup: {
    weapons: [],
    armor: [],
    tools: [],
    gear: [],
    magicItems: [],
    vehicles: [],
    mounts: [],
  },
  missingItemSlugs: [],
  unselectableReasons: [],
  isSelectable: true,
  funding: {
    classOptionId: 'starting-gold',
    classOptionWealth: { cp: 0, sp: 0, gp: 155, pp: 0 },
    tierAdditionalWealth: { cp: 0, sp: 0, gp: 0, pp: 0 },
    totalStartingWealth: { cp: 0, sp: 0, gp: 155, pp: 0 },
    classOptionPolicy: 'included' as const,
  },
} satisfies StartingEquipmentOptionSummary

const heavyArmorSummary = {
  ...goldSummary,
  optionId: 'heavy-armor',
  label: 'Heavy Armor',
  description: "Chain Mail, Greatsword, Flail, 8 Javelins, Dungeoneer's Pack, and 4 GP.",
} satisfies StartingEquipmentOptionSummary

const packageCustomizationRows = [
  {
    entryId: 'chain-mail',
    label: 'Chain Mail',
    packageQuantity: 1,
    retainedQuantity: 1,
    kind: 'singleton' as const,
  },
  {
    entryId: 'javelin',
    label: 'Javelin',
    packageQuantity: 8,
    retainedQuantity: 6,
    kind: 'stack' as const,
  },
  {
    entryId: 'flail',
    label: 'Flail',
    packageQuantity: 1,
    retainedQuantity: 0,
    kind: 'singleton' as const,
  },
]

const meta = {
  title: 'Character Builder/StartingEquipmentOptionSummary',
  component: StartingEquipmentOptionSummaryCard,
  parameters: { layout: 'padded' },
  args: {
    summary: goldSummary,
    density: 'default',
    onChangePackage: () => undefined,
  },
} satisfies Meta<typeof StartingEquipmentOptionSummaryCard>

export default meta
type Story = StoryObj<typeof meta>

export const StartingGold: Story = {}

export const HeavyArmorPackage: Story = {
  args: {
    summary: heavyArmorSummary,
  },
}

/** Quick NPC–style stack: compact selected card + panel-tone embedded slot + inner customization panel. */
export const PackageCustomizationEmbedded: Story = {
  args: {
    summary: heavyArmorSummary,
    density: 'compact',
    showChangePackage: false,
    description: heavyArmorSummary.description,
    titleAdornment: <SelectionOptionCardTitleMeta>Customized</SelectionOptionCardTitleMeta>,
    headerEndSlot: (
      <SelectionOptionCardHeaderAction
        label={EQUIPMENT_CHANGE_PACKAGE_LABEL}
        density="compact"
        onClick={() => undefined}
      />
    ),
    embeddedTone: 'panel',
    embedded: (
      <QuickNpcPackageCustomizationPanel
        packageLabel={heavyArmorSummary.label}
        rows={packageCustomizationRows}
        wealthLabel="4 GP"
        draftQuantities={{ javelin: 6, flail: 0 }}
        submittedQuantities={{}}
        showLockMessage={false}
        onChangeQuantity={() => undefined}
        onRemove={() => undefined}
        onRestore={() => undefined}
        onRestoreAll={() => undefined}
        onCancel={() => undefined}
        onSave={() => undefined}
      />
    ),
  },
}
