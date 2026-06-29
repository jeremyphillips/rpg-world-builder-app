import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { MarkdownField } from './markdown-field.client'

const meta = {
  title: 'Forms/MarkdownField',
  component: MarkdownField,
  args: {
    id: 'description',
    label: 'Description',
    value: '## Context\n\nAgents write **markdown** here.',
  },
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '')
    return <MarkdownField {...args} value={value} onChange={setValue} />
  },
} satisfies Meta<typeof MarkdownField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHint: Story = {
  args: {
    hint: 'Markdown supported. Headings, lists, and code fences are OK.',
  },
}

export const WithError: Story = {
  args: {
    error: 'Add a short description.',
    value: '',
  },
}

export const LegacyHtmlPreview: Story = {
  args: {
    value: '<p>Legacy <strong>HTML</strong> ticket description.</p>',
    hint: 'Switch to Preview to see the HTML fallback until re-saved.',
  },
}

export const Empty: Story = {
  args: {
    value: '',
  },
}
