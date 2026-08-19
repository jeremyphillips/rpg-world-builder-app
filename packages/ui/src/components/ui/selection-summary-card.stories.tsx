import type { Meta, StoryObj } from '@storybook/react-vite'

import { SelectionSummaryCard, SelectionSummaryChangeAction } from './selection-summary-card'

const meta = {
  title: 'Forms/SelectionSummaryCard',
  component: SelectionSummaryCard,
  args: {
    eyebrow: 'Selections',
    rows: [
      {
        label: 'Title',
        value: 'Guildmaster',
        action: (
          <SelectionSummaryChangeAction
            changeLabel="Change"
            ariaLabel="Change title"
            onChange={() => undefined}
          />
        ),
      },
      {
        label: 'Species',
        value: 'Gnome',
        action: (
          <SelectionSummaryChangeAction
            changeLabel="Change"
            ariaLabel="Change species"
            onChange={() => undefined}
          />
        ),
      },
    ],
  },
} satisfies Meta<typeof SelectionSummaryCard>

export default meta
type Story = StoryObj<typeof meta>

export const SetupSelections: Story = {}

export const AuthoringSetup: Story = {
  args: {
    eyebrow: 'Setup',
    cardAction: (
      <SelectionSummaryChangeAction
        changeLabel="Change"
        ariaLabel="Change setup"
        onChange={() => undefined}
      />
    ),
    rows: [
      { label: 'Role', value: 'Apprentice' },
      { label: 'Character', value: 'Elf · Level 1 Rogue' },
      { label: 'Build', value: 'Covert operator' },
    ],
  },
}

export const LongValues: Story = {
  args: {
    rows: [
      {
        label: 'Title',
        value: 'Grandmaster of the Ancient Order of the Silver Lantern',
        action: (
          <SelectionSummaryChangeAction
            changeLabel="Change"
            ariaLabel="Change title"
            onChange={() => undefined}
          />
        ),
      },
      {
        label: 'Species',
        value: 'Rock Gnome with an unusually long catalog display name',
        action: (
          <SelectionSummaryChangeAction
            changeLabel="Change"
            ariaLabel="Change species"
            onChange={() => undefined}
          />
        ),
      },
    ],
  },
}
