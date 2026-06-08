import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { FieldRow, NumberField, SelectField } from '../index'

const DIE_FACES = [4, 6, 8, 10, 12, 20, 100] as const

/**
 * The canonical "XdY" recipe: a narrow `NumberField` for the count next to a
 * `SelectField` for the die face, composed in a `FieldRow`. The count keeps its
 * intrinsic `xs` width; the die face fills the rest.
 */
function DiceNotation() {
  const [count, setCount] = useState(1)
  const [faces, setFaces] = useState('6')

  const notation = `${count > 0 ? count : 1}d${faces}`

  return (
    <div className="max-w-md space-y-4">
      <FieldRow>
        <NumberField
          id="dice-count"
          label="Count"
          min={1}
          max={99}
          value={count}
          onChange={(event) => setCount(event.target.valueAsNumber || 0)}
        />
        <SelectField
          id="dice-face"
          label="Die face"
          width="full"
          value={faces}
          onValueChange={setFaces}
          options={DIE_FACES.map((face) => ({ label: `d${face}`, value: String(face) }))}
        />
      </FieldRow>
      <p className="text-sm text-muted-foreground">
        Rolls <span className="font-mono font-medium text-foreground">{notation}</span>
      </p>
    </div>
  )
}

const meta = {
  title: 'Recipes/DiceNotation',
  component: DiceNotation,
} satisfies Meta<typeof DiceNotation>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
