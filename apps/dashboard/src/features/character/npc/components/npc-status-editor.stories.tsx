import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { createDefaultCampaignRosterState, createDefaultCharacterVitalState } from '@rpg/contracts'

import { NpcStatusEditor } from './npc-status-editor.client'

const meta = {
  title: 'Dashboard/Character/NpcStatusEditor',
  component: NpcStatusEditor,
  args: {
    campaignId: 'campaign-1',
    npcId: 'npc-1',
    vital: createDefaultCharacterVitalState(),
    roster: createDefaultCampaignRosterState(),
    open: true,
  },
  render: (args) => {
    const [open, setOpen] = useState(args.open)
    return <NpcStatusEditor {...args} open={open} onOpenChange={setOpen} />
  },
} satisfies Meta<typeof NpcStatusEditor>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onOpenChange: () => undefined,
  },
}
