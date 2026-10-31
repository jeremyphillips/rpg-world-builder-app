import type { Meta, StoryObj } from '@storybook/react-vite'

import { ListGroupHeading } from './list-group-heading.client'
import { InteractiveList } from './interactive-list.client'
import { InteractiveListRow } from './interactive-list-row.client'
import { POPOVER_INTERACTIVE_LIST_DENSITY } from './list-density.lib'

const meta = {
  title: 'UI/ListGroupHeading',
  component: ListGroupHeading,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-80 overflow-hidden rounded-md border border-border bg-background">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ListGroupHeading>

export default meta
type Story = StoryObj<typeof meta>

export const LabelOnly: Story = {
  args: {
    label: 'Recent spells',
    first: true,
  },
}

export const WithCount: Story = {
  args: {
    as: 'h2',
    label: 'Content',
    count: 14,
    first: true,
  },
}

export const FollowsCompleteGroup: Story = {
  render: () => (
    <>
      <ListGroupHeading label="Game terms" count={2} first />
      <InteractiveList density={POPOVER_INTERACTIVE_LIST_DENSITY}>
        <InteractiveListRow name="Advantage" />
      </InteractiveList>
      <ListGroupHeading label="Content" count={8} follows="complete" />
      <InteractiveList density={POPOVER_INTERACTIVE_LIST_DENSITY}>
        <InteractiveListRow name="Fireball" classification="Spell" />
      </InteractiveList>
    </>
  ),
}
