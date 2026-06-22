import type { Meta, StoryObj } from '@storybook/react-vite'

import { FormActionsBar } from './form-actions-bar'
import { FormSaveFooter } from './form-save-footer'

const meta = {
  title: 'Forms/FormActionsBar',
  component: FormActionsBar,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FormActionsBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: <FormSaveFooter submitLabel="Save changes" />,
  },
}

export const WithFormError: Story = {
  args: {
    formError: 'Something went wrong. Please try again.',
    children: <FormSaveFooter submitLabel="Save changes" />,
  },
}
