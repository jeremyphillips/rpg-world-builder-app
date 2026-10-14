import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { AbilityScoreCard } from './ability-score-card'
import { AbilityScoreNumeric } from './ability-score-numeric'
import { AbilityScoreRecommendationIndicator } from './ability-score-recommendation-indicator'
import { AbilityScoreSelect } from './ability-score-select'

const POOL = [8, 10, 12, 13, 14, 15]

const meta = {
  title: 'Dashboard/AbilityScoreCard',
  parameters: { layout: 'centered' },
} satisfies Meta

export default meta

type Story = StoryObj

export const DisplayMd: Story = {
  render: () => <AbilityScoreCard ability="str" value={15} className="w-[100px]" />,
}

export const DisplaySm: Story = {
  render: () => <AbilityScoreCard ability="str" value={15} size="sm" className="w-full" />,
}

export const SelectFilled: Story = {
  render: () => (
    <AbilityScoreSelect ability="str" value={14} scores={POOL} onSelect={() => undefined} />
  ),
}

export const SelectEmpty: Story = {
  render: () => (
    <AbilityScoreSelect ability="str" value={null} scores={POOL} onSelect={() => undefined} />
  ),
}

export const SelectDragOver: Story = {
  render: () => (
    <AbilityScoreSelect
      ability="str"
      value={null}
      scores={POOL}
      state="dragOver"
      onSelect={() => undefined}
    />
  ),
}

export const NumericResting: Story = {
  render: () => (
    <AbilityScoreNumeric ability="str" value={15} min={1} max={20} onCommit={() => undefined} />
  ),
}

export const NumericWithFooter: Story = {
  render: () => (
    <AbilityScoreNumeric
      ability="str"
      value={15}
      min={1}
      max={30}
      onCommit={() => undefined}
      footer={<span className="text-style-label">Save prof.</span>}
    />
  ),
}

export const NumericDisabled: Story = {
  render: () => (
    <AbilityScoreNumeric
      ability="str"
      value={15}
      min={1}
      max={20}
      disabled
      onCommit={() => undefined}
    />
  ),
}

export const WithRecommendationStar: Story = {
  render: () => (
    <AbilityScoreCard
      ability="str"
      value={15}
      headerAdornment={
        <AbilityScoreRecommendationIndicator label="Recommended primary ability for Fighter." />
      }
      className="w-[100px]"
    />
  ),
}

export const SelectPopoverOpen: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true)
    return (
      <AbilityScoreSelect
        ability="dex"
        value={null}
        scores={POOL}
        open={open}
        onOpenChange={setOpen}
        usedBy={{
          8: { abilityLabel: 'Strength', compactLabel: 'STR' },
          10: { abilityLabel: 'Strength', compactLabel: 'STR' },
          12: { abilityLabel: 'Strength', compactLabel: 'STR' },
          13: { abilityLabel: 'Strength', compactLabel: 'STR' },
          14: { abilityLabel: 'Strength', compactLabel: 'STR' },
        }}
        onSelect={() => undefined}
      />
    )
  },
}

export const SixColumnRow: Story = {
  render: () => (
    <div className="grid max-w-4xl grid-cols-6 gap-3">
      {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((ability) => (
        <AbilityScoreNumeric
          key={ability}
          ability={ability}
          value={10}
          min={1}
          max={30}
          size="sm"
          onCommit={() => undefined}
        />
      ))}
    </div>
  ),
}
