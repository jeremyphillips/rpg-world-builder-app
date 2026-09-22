import type { Meta, StoryObj } from '@storybook/react-vite'

import { SplitButton } from './split-button.client'

const meta = {
  title: 'UI/SplitButton',
  component: SplitButton,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SplitButton>

export default meta

type Story = StoryObj<typeof meta>

export const PrimaryOnly: Story = {
  args: {
    label: 'Add organization',
    onPrimaryClick: () => undefined,
  },
}

export const WithShortcuts: Story = {
  args: {
    label: 'Add person',
    onPrimaryClick: () => undefined,
    menuGroups: [
      {
        id: 'family',
        label: 'Family',
        items: [
          { id: 'parent', label: 'Add parent', onSelect: () => undefined },
          { id: 'child', label: 'Add child', onSelect: () => undefined },
        ],
      },
      {
        id: 'other',
        label: 'Other relationships',
        items: [{ id: 'friend', label: 'Add friend', onSelect: () => undefined }],
      },
    ],
  },
}
