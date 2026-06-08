import type { Meta, StoryObj } from '@storybook/react-vite'

import { RichTextField } from './rich-text-field'

const meta = {
  title: 'Forms/RichTextField',
  component: RichTextField,
  args: {
    id: 'bio',
    label: 'Biography',
    value: '<p>A wandering <strong>bard</strong>.</p>',
  },
} satisfies Meta<typeof RichTextField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHint: Story = { args: { hint: 'Bold and italics are supported.' } }

export const Linkable: Story = { args: { linkable: true } }

export const WithError: Story = { args: { error: 'Add a short backstory.', value: '' } }

export const Disabled: Story = { args: { disabled: true } }
