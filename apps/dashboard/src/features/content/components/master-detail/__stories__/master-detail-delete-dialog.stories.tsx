import type { Meta, StoryObj } from '@storybook/react-vite'

import { MasterDetailDeleteDialog } from '../master-detail-delete-dialog'

const meta = {
  title: 'Content/MasterDetailDeleteDialog',
  component: MasterDetailDeleteDialog,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof MasterDetailDeleteDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: {
    open: true,
    itemNoun: 'feature',
    itemName: 'Rage',
    onOpenChange: () => {},
    onConfirm: () => {},
  },
}
