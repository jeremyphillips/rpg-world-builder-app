import { useState, type ComponentProps } from 'react'
import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { RollValueField } from './roll-value-field.client'
import type { RollValueFieldParts } from './roll-value-field.lib'

function RollValuePreview({
  initialParts,
  ...props
}: Omit<ComponentProps<typeof RollValueField>, 'parts' | 'onPartsChange'> & {
  initialParts: RollValueFieldParts
}) {
  const [parts, setParts] = useState(initialParts)

  return (
    <RollValueField
      {...props}
      parts={parts}
      onPartsChange={(patch) => {
        setParts((current) => {
          const next = { ...current }
          if (patch.clearFlat) {
            delete next.flatOperator
            delete next.flatAmount
          }
          if (patch.diceCount !== undefined) next.diceCount = patch.diceCount
          if (patch.diceFaces !== undefined) next.diceFaces = patch.diceFaces
          if (patch.flatOperator !== undefined) next.flatOperator = patch.flatOperator
          if (patch.flatAmount !== undefined) next.flatAmount = patch.flatAmount
          return next
        })
        action('onPartsChange')(patch)
      }}
    />
  )
}

const meta = {
  title: 'Forms/RollValueField',
  component: RollValuePreview,
  args: {
    id: 'roll-value',
    label: 'Damage roll',
    initialParts: { diceCount: 1, diceFaces: 12 },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RollValuePreview>

export default meta
type Story = StoryObj<typeof meta>

export const DiceOnly: Story = {}

export const DicePlusFlat: Story = {
  args: {
    initialParts: { diceCount: 2, diceFaces: 6, flatOperator: '+', flatAmount: 4 },
  },
}

export const FlatOnly: Story = {
  args: {
    initialParts: { flatOperator: '+', flatAmount: 1 },
  },
}
