import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from './button.client'
import { RadioGroup } from './radio-group.client'
import { RadioOptionCard, RadioOptionCardTitleAdornment } from './radio-option-card.client'
import { SelectionOptionCardTitleMeta } from './selection-option-card-anatomy.client'
import { NumberStepper } from './number-stepper.client'
import {
  SelectionOptionCardEmbeddedPanel,
  SelectionOptionCardEmbeddedPanelHeader,
  SelectionOptionCardEmbeddedPanelList,
  SelectionOptionCardEmbeddedPanelRow,
  SelectionOptionCardEmbeddedPanelRowStatus,
} from './selection-option-card-embedded-panel.client'
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

export const SelectedWithTitleAdornment: Story = {
  args: {
    headerEyebrow: 'Selected package',
    label: 'Heavy Armor',
    titleAdornment: <SelectionOptionCardTitleMeta>Customized</SelectionOptionCardTitleMeta>,
    description: 'Chain Mail, Greatsword, 6 Javelins, and 4 GP.',
  },
}

export const SelectedWithEmbedded: Story = {
  args: {
    headerEyebrow: 'Selected package',
    label: 'Heavy Armor',
    description: 'Chain Mail, Greatsword, and 8 Javelins.',
    embeddedTone: 'panel',
    embedded: (
      <SelectionOptionCardEmbeddedPanel>
        <SelectionOptionCardEmbeddedPanelHeader
          title="Customize Heavy Armor"
          description="Adjust what this NPC keeps from the selected package."
        />
        <SelectionOptionCardEmbeddedPanelList>
          <SelectionOptionCardEmbeddedPanelRow label="Javelin">
            <NumberStepper
              size="xs"
              min={0}
              max={8}
              value={6}
              aria-label="Quantity of Javelin kept from Heavy Armor"
              onChange={() => undefined}
            />
            <Button type="button" variant="text" size="xs" density="compact">
              Remove
            </Button>
          </SelectionOptionCardEmbeddedPanelRow>
          <SelectionOptionCardEmbeddedPanelRow label="Flail">
            <SelectionOptionCardEmbeddedPanelRowStatus>
              Removed
            </SelectionOptionCardEmbeddedPanelRowStatus>
            <Button type="button" variant="text" size="xs" density="compact">
              Restore
            </Button>
          </SelectionOptionCardEmbeddedPanelRow>
        </SelectionOptionCardEmbeddedPanelList>
      </SelectionOptionCardEmbeddedPanel>
    ),
  },
}

export const SelectedSummaryCompact: Story = {
  args: {
    density: 'compact',
    headerEyebrow: 'Selected package',
    headerEndSlot: (
      <SelectionOptionCardHeaderAction
        label="Change package"
        density="compact"
        onClick={() => undefined}
      />
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
          <SelectionOptionCardHeaderAction
            label="Change package"
            density="compact"
            onClick={() => undefined}
          />
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
              density="compact"
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
