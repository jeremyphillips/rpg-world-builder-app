import type { Meta, StoryObj } from '@storybook/react-vite'

import { QuickNpcPackageCustomizationPanel } from './quick-npc-package-customization-panel'

const rows = [
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
  title: 'Features/Character/Quick NPC/Package customization',
  component: QuickNpcPackageCustomizationPanel,
  args: {
    packageLabel: 'Heavy Armor',
    rows,
    wealthLabel: '4 GP',
    draftQuantities: { javelin: 6, flail: 0 },
    submittedQuantities: {},
    showLockMessage: false,
    onChangeQuantity: () => undefined,
    onRemove: () => undefined,
    onRestore: () => undefined,
    onRestoreAll: () => undefined,
    onCancel: () => undefined,
    onSave: () => undefined,
  },
} satisfies Meta<typeof QuickNpcPackageCustomizationPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Editing: Story = {}

export const LockMessage: Story = {
  args: {
    showLockMessage: true,
  },
}
