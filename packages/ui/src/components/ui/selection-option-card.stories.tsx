import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from './button.client'
import { RadioGroup } from './radio-group.client'
import { RadioOptionCard, RadioOptionCardTitleAdornment } from './radio-option-card.client'
import {
  SelectionOptionCard,
  SelectionOptionCardHeaderAction,
} from './selection-option-card.client'

const meta = {
  title: 'Forms/Controls/SelectionOptionCard',
  component: SelectionOptionCard,
  args: {
    selected: true,
    label: 'Starting equipment package',
    description: 'Includes a martial weapon, shield, and explorer pack.',
    summaryLines: ['Gold remaining: 12 gp', 'Items selected: 4'],
  },
} satisfies Meta<typeof SelectionOptionCard>

export default meta
type Story = StoryObj<typeof meta>

export const SelectedSummary: Story = {
  args: {
    headerEyebrow: 'Selected package',
    headerEndSlot: (
      <SelectionOptionCardHeaderAction label="Change package" onClick={() => undefined} />
    ),
  },
}

export const SelectedSummaryCompact: Story = {
  args: {
    density: 'compact',
    headerEyebrow: 'Selected package',
    headerEndSlot: (
      <SelectionOptionCardHeaderAction label="Change package" onClick={() => undefined} />
    ),
  },
}

export const VisualParityComparison: Story = {
  name: 'Visual parity — radio vs static selected',
  render: () => (
    <div className="grid max-w-xl gap-4">
      <RadioGroup aria-label="Package chooser" defaultValue="a">
        <RadioOptionCard
          value="a"
          label="Starting equipment package"
          description="Includes a martial weapon, shield, and explorer pack."
          summaryItems={['Gold remaining: 12 gp', 'Items selected: 4']}
          density="compact"
          titleAdornment={<RadioOptionCardTitleAdornment badge="Recommended" />}
        />
      </RadioGroup>
      <RadioGroup aria-label="Package chooser unselected" defaultValue="">
        <RadioOptionCard
          value="b"
          label="Starting equipment package"
          description="Includes a martial weapon, shield, and explorer pack."
          summaryItems={['Gold remaining: 12 gp', 'Items selected: 4']}
          density="compact"
        />
      </RadioGroup>
      <SelectionOptionCard
        selected
        density="compact"
        label="Starting equipment package"
        description="Includes a martial weapon, shield, and explorer pack."
        summaryLines={['Gold remaining: 12 gp', 'Items selected: 4']}
        headerEyebrow="Selected package"
        headerEndSlot={
          <SelectionOptionCardHeaderAction label="Change package" onClick={() => undefined} />
        }
      />
    </div>
  ),
}

function CompactStateTransitionDemo() {
  const [selected, setSelected] = React.useState(false)
  const label = 'Starting equipment package'
  const description = 'Includes a martial weapon, shield, and explorer pack.'
  const summaryLines = ['Gold remaining: 12 gp', 'Items selected: 4']

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setSelected((value) => !value)}
      >
        {selected ? 'Show chooser' : 'Show selected'}
      </Button>
      {selected ? (
        <SelectionOptionCard
          selected
          density="compact"
          headerEyebrow="Selected package"
          headerEndSlot={
            <SelectionOptionCardHeaderAction
              label="Change package"
              onClick={() => setSelected(false)}
            />
          }
          label={label}
          description={description}
          summaryLines={summaryLines}
        />
      ) : (
        <RadioGroup aria-label="Package chooser" value="pkg">
          <RadioOptionCard
            value="pkg"
            label={label}
            description={description}
            summaryLines={summaryLines}
            density="compact"
          />
        </RadioGroup>
      )}
    </div>
  )
}

export const CompactStateTransition: Story = {
  name: 'Compact density — chooser to selected transition',
  render: () => <CompactStateTransitionDemo />,
}
