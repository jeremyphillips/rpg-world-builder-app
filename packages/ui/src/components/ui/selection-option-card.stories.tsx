import type { Meta, StoryObj } from '@storybook/react-vite'

import { Eyebrow } from './eyebrow'
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
    headerStartSlot: <Eyebrow>Selected package</Eyebrow>,
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
        label="Starting equipment package"
        description="Includes a martial weapon, shield, and explorer pack."
        summaryLines={['Gold remaining: 12 gp', 'Items selected: 4']}
        headerStartSlot={<Eyebrow>Selected package</Eyebrow>}
        headerEndSlot={
          <SelectionOptionCardHeaderAction label="Change package" onClick={() => undefined} />
        }
      />
    </div>
  ),
}
