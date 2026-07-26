import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { makeCampaignNpcListItem } from '../../lib/character-fixtures'
import { BulkRosterStatusDialog } from './bulk-roster-status-dialog.client'

const meta = {
  title: 'Dashboard/Character/BulkRosterStatusDialog',
  component: BulkRosterStatusDialog,
  args: {
    campaignId: 'campaign-1',
    open: true,
    selectedRows: [makeCampaignNpcListItem({ character: { id: 'npc-1', name: 'Captain Aldric' } })],
    onApplyComplete: () => undefined,
  },
  render: (args) => {
    const [open, setOpen] = useState(args.open)
    return <BulkRosterStatusDialog {...args} open={open} onOpenChange={setOpen} />
  },
} satisfies Meta<typeof BulkRosterStatusDialog>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onOpenChange: () => undefined,
  },
}
