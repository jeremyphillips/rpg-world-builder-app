import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { JoinedPair } from './joined-pair-field.client'

function SelectLabelSpeedStory() {
  const [feet, setFeet] = useState<number | undefined>(30)

  return (
    <JoinedPair.Root aria-label="Speed">
      <JoinedPair.SelectOccupant
        id="speed-value"
        ariaLabel="Speed value"
        value={feet}
        options={[
          { value: 30, label: '30' },
          { value: 40, label: '40' },
          { value: 50, label: '50' },
        ]}
        size="md"
        position="start"
        digits={3}
        onValueChange={(next) => setFeet(typeof next === 'number' ? next : undefined)}
      />
      <JoinedPair.Divider />
      <JoinedPair.LabelOccupant text="ft." ariaLabel="Speed unit" size="md" />
    </JoinedPair.Root>
  )
}

function SelectSelectSpeedStory() {
  const [feet, setFeet] = useState<number | undefined>(30)
  const [unit, setUnit] = useState<string | undefined>('ft')

  return (
    <JoinedPair.Root aria-label="Speed">
      <JoinedPair.SelectOccupant
        id="speed-value"
        ariaLabel="Speed value"
        value={feet}
        options={[
          { value: 30, label: '30' },
          { value: 40, label: '40' },
        ]}
        size="md"
        position="start"
        digits={3}
        onValueChange={(next) => setFeet(typeof next === 'number' ? next : undefined)}
      />
      <JoinedPair.Divider />
      <JoinedPair.SelectOccupant
        id="speed-unit"
        ariaLabel="Speed unit"
        value={unit}
        options={[
          { value: 'ft', label: 'ft.' },
          { value: 'm', label: 'm' },
        ]}
        size="md"
        position="end"
        onValueChange={(next) => setUnit(typeof next === 'string' ? next : undefined)}
      />
    </JoinedPair.Root>
  )
}

function NumberSelectStory() {
  const [value, setValue] = useState<number | undefined>(50)
  const [unit, setUnit] = useState<string | undefined>('ft')

  return (
    <JoinedPair.Root layout="stretch" aria-label="Distance">
      <JoinedPair.NumberOccupant
        id="distance-value"
        ariaLabel="Distance value"
        value={value}
        size="md"
        digits={3}
        onValueChange={setValue}
      />
      <JoinedPair.Divider />
      <JoinedPair.SelectOccupant
        id="distance-unit"
        ariaLabel="Distance unit"
        value={unit}
        options={[
          { value: 'ft', label: 'ft.' },
          { value: 'mi', label: 'mi.' },
        ]}
        size="md"
        position="end"
        onValueChange={(next) => setUnit(typeof next === 'string' ? next : undefined)}
      />
    </JoinedPair.Root>
  )
}

const meta = {
  title: 'UI/JoinedPair',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const SelectLabelSpeed: Story = {
  render: () => <SelectLabelSpeedStory />,
}

export const SelectSelectSpeed: Story = {
  render: () => <SelectSelectSpeedStory />,
}

export const NumberSelectDistance: Story = {
  render: () => <NumberSelectStory />,
}
