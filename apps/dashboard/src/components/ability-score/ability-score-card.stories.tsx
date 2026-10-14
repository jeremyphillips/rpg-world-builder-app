import type { Meta, StoryObj } from '@storybook/react'
import { useMemo, useState } from 'react'

import { Checkbox } from '@rpg/ui'

import { buildFixedScoreSelectOptions } from '@/features/character/lib/steps/fixed-scores-assignment.lib'

import { AbilityScoreCard } from './ability-score-card'

import {
  abilityScoreCardFooterActionClasses,
  abilityScoreCardFooterActionLabelClasses,
} from './ability-score-card.variants'
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
  render: () => (
    <div className="w-[100px]">
      <AbilityScoreCard ability="str" value={15} />
    </div>
  ),
}

export const DisplaySm: Story = {
  render: () => (
    <div className="w-full max-w-[120px]">
      <AbilityScoreCard ability="str" value={15} size="sm" />
    </div>
  ),
}

export const SelectFilled: Story = {
  render: () => {
    const scoreOptions = buildFixedScoreSelectOptions('str', { str: 14 }, POOL)
    return (
      <AbilityScoreSelect
        ability="str"
        value={14}
        scoreOptions={scoreOptions}
        onSelect={() => undefined}
      />
    )
  },
}

export const SelectEmpty: Story = {
  render: () => {
    const scoreOptions = buildFixedScoreSelectOptions('str', {}, POOL)
    return (
      <AbilityScoreSelect
        ability="str"
        value={null}
        scoreOptions={scoreOptions}
        onSelect={() => undefined}
      />
    )
  },
}

export const SelectDragOver: Story = {
  render: () => {
    const scoreOptions = buildFixedScoreSelectOptions('str', {}, POOL)
    return (
      <AbilityScoreSelect
        ability="str"
        value={null}
        scoreOptions={scoreOptions}
        state="dragOver"
        onSelect={() => undefined}
      />
    )
  },
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
      footer={
        <label className={abilityScoreCardFooterActionClasses}>
          <Checkbox checked={false} aria-label="Strength saving throw proficiency" />
          <span className={abilityScoreCardFooterActionLabelClasses} aria-hidden>
            Save prof.
          </span>
        </label>
      }
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
    <div className="w-[100px]">
      <AbilityScoreCard
        ability="str"
        value={15}
        headerAdornment={
          <AbilityScoreRecommendationIndicator label="Recommended primary ability for Fighter." />
        }
      />
    </div>
  ),
}

export const SelectPopoverOpen: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true)
    const scoreOptions = useMemo(() => buildFixedScoreSelectOptions('dex', { str: 15 }, POOL), [])
    return (
      <AbilityScoreSelect
        ability="dex"
        value={null}
        scoreOptions={scoreOptions}
        open={open}
        onOpenChange={setOpen}
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
