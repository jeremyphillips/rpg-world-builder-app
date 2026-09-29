import type { Meta, StoryObj } from '@storybook/react-vite'

import { EntityActionChoiceMenu } from './entity-action-choice-menu'

const meta = {
  title: 'Content/Entity/EntityActionChoiceMenu',
  component: EntityActionChoiceMenu,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EntityActionChoiceMenu>

export default meta
type Story = StoryObj<typeof EntityActionChoiceMenu>

export const Labeled: Story = {
  args: {
    triggerLabel: 'Add location',
    items: [
      {
        id: 'building',
        label: 'Building',
        description:
          'Add a distinct structure—not a room—such as an annex, tower, stable, or workshop.',
        onSelect: () => undefined,
      },
      {
        id: 'site',
        label: 'Site',
        description: 'A bounded outdoor or mixed-use place under this location.',
        onSelect: () => undefined,
      },
    ],
  },
}

export const IconWithHeading: Story = {
  args: {
    appearance: 'icon',
    triggerLabel: 'Add location to Dock Ward',
    menuHeading: 'Add to Dock Ward',
    items: [
      {
        id: 'building',
        label: 'Building',
        description:
          'Add a distinct structure—not a room—such as an annex, tower, stable, or workshop.',
        onSelect: () => undefined,
      },
    ],
  },
}
