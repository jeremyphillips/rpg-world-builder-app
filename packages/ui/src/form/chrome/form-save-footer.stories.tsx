import type { Meta, StoryObj } from '@storybook/react-vite'

import { FormSaveFooter } from './form-save-footer'

const meta = {
  title: 'Forms/FormSaveFooter',
  component: FormSaveFooter,
  args: {
    submitLabel: 'Save changes',
    successMessage: 'Changes saved.',
  },
} satisfies Meta<typeof FormSaveFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Pending: Story = {
  args: { pending: true },
}

export const Success: Story = {
  args: { isSuccess: true },
}
