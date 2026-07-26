import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { createDefaultCharacterLifecycle } from '@rpg/contracts'

import { NpcLifecycleEditor } from './npc-lifecycle-editor.client'

const meta = {
  title: 'Dashboard/Character/NpcLifecycleEditor',
  component: NpcLifecycleEditor,
  args: {
    campaignId: 'campaign-1',
    npcId: 'npc-1',
    lifecycle: createDefaultCharacterLifecycle(),
    open: true,
  },
  render: (args) => {
    const [open, setOpen] = useState(args.open)
    return <NpcLifecycleEditor {...args} open={open} onOpenChange={setOpen} />
  },
} satisfies Meta<typeof NpcLifecycleEditor>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onOpenChange: () => undefined,
  },
}
