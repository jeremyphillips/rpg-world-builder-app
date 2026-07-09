import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Button } from './button.client'
import { Text } from './text'
import { AttentionFrame } from './attention-frame.client'

function AttentionFrameDemo({ initialActive = false }: { initialActive?: boolean }) {
  const [active, setActive] = useState(initialActive)

  return (
    <div className="space-y-4">
      <Button type="button" onClick={() => setActive(true)}>
        Show attention
      </Button>
      <AttentionFrame active={active} onAttentionComplete={() => setActive(false)} className="p-4">
        <Text>Choose a dependent option below.</Text>
      </AttentionFrame>
    </div>
  )
}

const meta = {
  title: 'Primitives/AttentionFrame',
  component: AttentionFrame,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof AttentionFrame>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <AttentionFrameDemo />,
}

export const Active: Story = {
  render: () => <AttentionFrameDemo initialActive />,
}
