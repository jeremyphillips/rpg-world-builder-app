import type { Meta, StoryObj } from '@storybook/react-vite'

import { RichTextField } from './rich-text-field'
import type { RichTextLinkPickerInternalOption } from './rich-text-link-picker.types'

const demoInternalLinkOptions: RichTextLinkPickerInternalOption[] = [
  {
    id: 'fireball',
    title: 'Fireball',
    href: '/campaigns/demo/content/spells/fireball',
    contentType: 'spell',
    kind: 'detail',
  },
  {
    id: 'spell-overview',
    title: 'Spell Overview',
    href: '/campaigns/demo/content/spells',
    contentType: 'spell',
    kind: 'overview',
  },
]

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

export const LinkableWithInternalLinks: Story = {
  args: {
    linkable: true,
    internalLinkOptions: demoInternalLinkOptions,
    hint: 'Use the link button to reference spells or overview pages.',
  },
}

export const WithError: Story = { args: { error: 'Add a short backstory.', value: '' } }

export const Disabled: Story = {
  args: { disabled: true },
  // The disabled editor fades its text via `opacity-50`; WCAG 2.2 SC 1.4.3
  // exempts disabled/inactive components from contrast minimums, so scope the
  // color-contrast check off for this state only (mirrors the unit tests).
  parameters: { a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } } },
}
