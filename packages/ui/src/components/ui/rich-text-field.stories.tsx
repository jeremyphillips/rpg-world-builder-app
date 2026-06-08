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

export const Disabled: Story = {
  args: { disabled: true },
  // The disabled editor fades its text via `opacity-50`; WCAG 2.2 SC 1.4.3
  // exempts disabled/inactive components from contrast minimums, so scope the
  // color-contrast check off for this state only (mirrors the unit tests).
  parameters: { a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } } },
}
