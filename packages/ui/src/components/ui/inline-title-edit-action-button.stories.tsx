import type { Meta, StoryObj } from '@storybook/react-vite'

import { InlineTitleEditActionButton } from './inline-title-edit-action-button.client'

const meta = {
  title: 'UI/InlineTitleEditActionButton',
  component: InlineTitleEditActionButton,
} satisfies Meta<typeof InlineTitleEditActionButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    editing: false,
    onClick: () => undefined,
  },
}

export const HiddenWhileEditing: Story = {
  args: {
    editing: true,
    onClick: () => undefined,
  },
}
