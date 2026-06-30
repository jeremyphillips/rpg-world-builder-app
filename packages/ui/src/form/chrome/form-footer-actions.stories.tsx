import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '../../components/ui/button.client'
import { FormActionsBar } from './form-actions-bar'
import { FormFooterActions } from './form-footer-actions'

const meta = {
  title: 'Forms/FormFooterActions',
  component: FormFooterActions,
  args: {
    submitLabel: 'Save changes',
    successMessage: 'Changes saved.',
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FormFooterActions>

export default meta
type Story = StoryObj<typeof meta>

export const SaveOnly: Story = {}

export const WithSecondary: Story = {
  args: {
    secondary: (
      <Button type="button" variant="outline">
        Cancel
      </Button>
    ),
  },
}

export const WithLeadingAndSecondary: Story = {
  args: {
    leading: (
      <Button type="button" variant="destructive">
        Delete
      </Button>
    ),
    secondary: (
      <Button type="button" variant="outline">
        Cancel
      </Button>
    ),
  },
}

export const InStickyActionsBar: Story = {
  render: (args) => (
    <FormActionsBar>
      <FormFooterActions {...args} />
    </FormActionsBar>
  ),
  args: {
    secondary: (
      <Button type="button" variant="outline">
        Cancel
      </Button>
    ),
  },
}

export const Success: Story = {
  args: { isSuccess: true },
}
