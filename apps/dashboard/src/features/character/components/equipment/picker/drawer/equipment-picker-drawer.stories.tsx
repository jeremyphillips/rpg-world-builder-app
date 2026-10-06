import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { DEFAULT_ARMOR_CLASS_BASE } from '@rpg/contracts'
import { Button } from '@rpg/ui'

import { EquipmentPickerDrawer } from './equipment-picker-drawer'
import {
  builderPathGoldBudgetFixture,
  fighterGoldPathPickerItemsFixture,
  wizardGoldPathPickerItemsFixture,
} from './equipment-picker-builder-path.fixtures'
import {
  equipmentPickerBudgetFixture,
  equipmentPickerDefaultPathItemsFixture,
  equipmentPickerItemsFixture,
  equipmentPickerLowRemainingBudgetFixture,
  equipmentPickerMagicItemAllowancesFixture,
  equipmentPickerMagicItemProgressFixture,
  equipmentPickerMagicItemsFixture,
  equipmentPickerRopeFixture,
  equipmentResolvedFixture,
} from './equipment-picker-drawer.fixtures'

const meta = {
  title: 'Character Builder/EquipmentPickerDrawer',
  component: EquipmentPickerDrawer,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EquipmentPickerDrawer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerItemsFixture,
    budget: equipmentPickerBudgetFixture,
    filterOutUnaffordable: false,
    onCommitAdd: () => undefined,
  },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open)

    return (
      <>
        <Button className="m-8" onClick={() => setOpen(true)}>
          Open equipment picker
        </Button>
        <EquipmentPickerDrawer {...args} open={open} onOpenChange={setOpen} />
      </>
    )
  },
}

export const DefaultPathAffordableNow: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerDefaultPathItemsFixture,
    budget: equipmentPickerLowRemainingBudgetFixture,
    filterOutUnaffordable: true,
    onCommitAdd: () => undefined,
  },
}

export const LowRemainingBudget: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerDefaultPathItemsFixture,
    budget: equipmentPickerLowRemainingBudgetFixture,
    filterOutUnaffordable: false,
    onCommitAdd: () => undefined,
  },
}

export const HideUnaffordable: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerItemsFixture,
    budget: equipmentPickerBudgetFixture,
    filterOutUnaffordable: true,
    onCommitAdd: () => undefined,
  },
}

export const HideNonProficient: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerItemsFixture,
    budget: equipmentPickerBudgetFixture,
    filterOutUnaffordable: false,
    filterOutNonProficient: true,
    onCommitAdd: () => undefined,
  },
}

export const CharacterPreview: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerItemsFixture,
    budget: equipmentPickerBudgetFixture,
    filterOutUnaffordable: false,
    showCharacterPreview: true,
    characterPreviewContext: {
      level: 1,
      armorClassBase: DEFAULT_ARMOR_CLASS_BASE,
      abilityScores: { str: 16, dex: 14 },
      equippedArmor: [],
      budget: equipmentPickerBudgetFixture,
    },
    onCommitAdd: () => undefined,
  },
}

export const ClearFilters: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerItemsFixture,
    budget: equipmentPickerBudgetFixture,
    filterOutUnaffordable: false,
    toolbarResetMode: 'clear_filters',
    onCommitAdd: () => undefined,
  },
}

export const SortByPrice: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerDefaultPathItemsFixture,
    budget: equipmentPickerLowRemainingBudgetFixture,
    filterOutUnaffordable: false,
    onCommitAdd: () => undefined,
  },
}

export const OwnedStackable: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: [equipmentPickerItemsFixture[2]!],
    budget: equipmentPickerBudgetFixture,
    ownedPurchaseQuantities: { [equipmentPickerRopeFixture.id]: 2 },
    onCommitAdd: () => undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Owned stackables show an owned-count badge and Add in the header row.',
      },
    },
  },
}

export const RecommendationFacts: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: [
      {
        ...equipmentPickerItemsFixture[0]!,
        state: {
          ...equipmentPickerItemsFixture[0]!.state,
          resolved: equipmentResolvedFixture(
            {
              requirements: [
                {
                  requirementId: 'wizard:spellbook',
                  owner: { kind: 'class', id: 'wizard' },
                  rule: 'exact',
                  optionSatisfies: true,
                  role: 'candidate',
                },
              ],
            },
            (source) => (source.kind === 'class' ? 'Wizard' : undefined),
          ),
        },
      },
      {
        ...equipmentPickerItemsFixture[2]!,
        state: {
          ...equipmentPickerItemsFixture[2]!.state,
          resolved: equipmentResolvedFixture(
            {
              recommendation: {
                strength: 'strong',
                signals: [
                  {
                    strength: 'strong',
                    basis: 'preference',
                    specificity: 'exact',
                    source: { kind: 'role', id: 'guard' },
                  },
                  {
                    strength: 'strong',
                    basis: 'authored',
                    specificity: 'exact',
                    source: { kind: 'class', id: 'fighter' },
                  },
                  {
                    strength: 'strong',
                    basis: 'preference',
                    specificity: 'exact',
                    source: { kind: 'user' },
                  },
                ],
              },
            },
            (source) => {
              if (source.kind === 'role') return 'Guard'
              if (source.kind === 'class') return 'Fighter'
              return undefined
            },
          ),
        },
      },
    ],
    budget: equipmentPickerBudgetFixture,
    filterOutUnaffordable: false,
    onCommitAdd: () => undefined,
  },
}

export const WizardGoldPath: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: [
      wizardGoldPathPickerItemsFixture.wand,
      wizardGoldPathPickerItemsFixture['component-pouch'],
      wizardGoldPathPickerItemsFixture.spellbook,
      wizardGoldPathPickerItemsFixture.greataxe,
      wizardGoldPathPickerItemsFixture.greatsword,
      wizardGoldPathPickerItemsFixture.dagger,
      wizardGoldPathPickerItemsFixture['plate-armor'],
    ],
    budget: builderPathGoldBudgetFixture,
    filterOutUnaffordable: false,
    isGoldShoppingPath: true,
    onCommitAdd: () => undefined,
  },
  parameters: {
    docs: {
      description: {
        story:
          'STR 8 Wizard on the gold path: blockers, warnings, then requirement / recommendation / source guidance on one metadata line.',
      },
    },
  },
}

export const AbilityScoreRequirements: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: [
      fighterGoldPathPickerItemsFixture['plate-armor'],
      fighterGoldPathPickerItemsFixture.splint,
      fighterGoldPathPickerItemsFixture['chain-mail'],
    ],
    budget: builderPathGoldBudgetFixture,
    filterOutUnaffordable: false,
    isGoldShoppingPath: true,
    onCommitAdd: () => undefined,
  },
  parameters: {
    docs: {
      description: {
        story:
          'STR 12 Fighter: unmet armor ability-score requirements are soft warnings (badge title carries the detail).',
      },
    },
  },
}

export const MagicItemsWorkflow: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerMagicItemsFixture,
    workflowMode: 'magic_items',
    workflowModes: ['purchase', 'magic_items'],
    magicItemAllowances: equipmentPickerMagicItemAllowancesFixture,
    magicItemGrantProgress: equipmentPickerMagicItemProgressFixture,
    onWorkflowModeChange: () => undefined,
    onFocusedAllowanceIdChange: () => undefined,
    onCommitAdd: () => undefined,
  },
}
