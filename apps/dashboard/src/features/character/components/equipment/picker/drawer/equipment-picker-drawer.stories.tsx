import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { DEFAULT_ARMOR_CLASS_BASE } from '@rpg/contracts'
import { Button } from '@rpg/ui'

import { EquipmentPickerDrawer } from './equipment-picker-drawer'
import { EMPTY_EQUIPMENT_OWNERSHIP } from '../../../../lib/equipment/equipment-ownership-index.lib'
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body)
    const sort = canvas.getByRole('button', { name: 'Sort by, Best match' })
    const sortWidth = sort.getBoundingClientRect().width
    await expect(sortWidth).toBeGreaterThan(0)
    await userEvent.click(sort)
    await userEvent.click(canvas.getByRole('menuitemradio', { name: 'Price: High to low' }))
    await expect(
      canvas.getByRole('button', { name: 'Sort by, Price: High' }).getBoundingClientRect().width,
    ).toBe(sortWidth)
  },
}

export const DefaultPathAffordableNow: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerDefaultPathItemsFixture,
    budget: equipmentPickerLowRemainingBudgetFixture,
    onCommitAdd: () => undefined,
  },
}

export const LowRemainingBudget: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerDefaultPathItemsFixture,
    budget: equipmentPickerLowRemainingBudgetFixture,
    onCommitAdd: () => undefined,
  },
}

export const HideNonProficient: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerItemsFixture,
    budget: equipmentPickerBudgetFixture,
    onCommitAdd: () => undefined,
  },
}

export const CharacterPreview: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerItemsFixture,
    budget: equipmentPickerBudgetFixture,
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

export const SortByPrice: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerDefaultPathItemsFixture,
    budget: equipmentPickerLowRemainingBudgetFixture,
    onCommitAdd: () => undefined,
  },
}

export const OwnedStackable: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: [equipmentPickerItemsFixture[2]!],
    budget: equipmentPickerBudgetFixture,
    ownership: new Map([
      [
        equipmentPickerRopeFixture.id,
        {
          ...EMPTY_EQUIPMENT_OWNERSHIP,
          editablePurchased: { quantity: 2, spendCp: 200 },
          totalQuantity: 2,
          acquiredQuantity: 2,
        },
      ],
    ]),
    onCommitAdd: () => undefined,
    onSetPurchasedQuantity: () => undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'A purchased stack shows Owned, then Purchased and the slice total.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Owned')).toBeInTheDocument()
    await expect(canvas.getByText('Purchased · 2 GP')).toBeInTheDocument()
    await expect(canvas.queryByText('Owned · Owned')).not.toBeInTheDocument()
  },
}

export const LoadoutOwned: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: [equipmentPickerItemsFixture[0]!],
    workflowMode: 'loadout',
    workflowModes: ['loadout'],
    resolveRowActionViewModel: () => ({
      kind: 'loadout',
      ownedQuantity: 1,
      plainQuantity: 1,
      customizedQuantity: 0,
    }),
    onCommitAdd: () => undefined,
    onSetRowQuantity: () => undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByText('Owned')).toHaveLength(1)
    await expect(canvas.queryByText('Purchased')).not.toBeInTheDocument()
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

export const Selection: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    title: 'Select armor',
    items: equipmentPickerItemsFixture.slice(0, 2),
    workflowMode: 'loadout',
    workflowModes: ['loadout'],
    selection: { value: null, onValueChange: () => undefined },
    footer: <Button>Select armor</Button>,
    onCommitAdd: () => undefined,
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
