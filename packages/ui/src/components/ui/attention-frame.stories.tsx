import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
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

const ATTENTION_FRAME_CLASS_SPECS = [
  {
    key: 'idle',
    className: 'ui-attention-frame',
    keyValues: 'transparent border, color transition',
    useCase: 'Resting region',
  },
  {
    key: 'active',
    className: 'ui-attention-frame ui-attention-frame--active',
    keyValues: 'primary border, selected fill, attention ring',
    useCase: 'Brief focus after a parent choice',
  },
] as const

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => (
    <ClassReferenceTable
      rows={ATTENTION_FRAME_CLASS_SPECS.map((spec) => ({
        key: spec.key,
        sample: (
          <div data-semantic-class-target className={spec.className}>
            Region
          </div>
        ),
        propsLabel: spec.key,
        className: spec.className,
        keyValues: spec.keyValues,
        useCase: spec.useCase,
      }))}
    />
  ),
}
