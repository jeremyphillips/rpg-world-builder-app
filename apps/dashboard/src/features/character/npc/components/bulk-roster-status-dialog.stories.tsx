import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { createDefaultCharacterLifecycle } from '@rpg/contracts'

import { SAMPLE_PC } from '../../lib/character-fixtures'
import { BulkRosterStatusDialog } from './bulk-roster-status-dialog.client'

const meta = {
  title: 'Dashboard/Character/BulkRosterStatusDialog',
  component: BulkRosterStatusDialog,
  args: {
    campaignId: 'campaign-1',
    open: true,
    selectedRows: [
      {
        ...SAMPLE_PC,
        id: 'npc-1',
        characterType: 'npc' as const,
        campaignId: 'campaign-1',
        userId: undefined,
        lifecycle: createDefaultCharacterLifecycle(),
      },
    ],
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
