import type { Meta, StoryObj } from '@storybook/react-vite'

import { ActionButton } from './action-button.client'

const meta = {
  title: 'UI/ActionButton',
  component: ActionButton,
  tags: ['autodocs'],
} satisfies Meta<typeof ActionButton>

export default meta

type Story = StoryObj<typeof meta>

export const AddWithLabel: Story = {
  args: {
    action: 'add',
    children: 'Add row',
    variant: 'outline',
    size: 'sm',
  },
}

export const EditIconOnly: Story = {
  args: {
    action: 'edit',
    variant: 'ghost',
    size: 'icon',
    'aria-label': 'Edit',
  },
}
