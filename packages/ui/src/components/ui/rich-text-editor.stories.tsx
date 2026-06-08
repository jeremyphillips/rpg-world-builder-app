import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { RichTextEditor } from './rich-text-editor.client'
import { sanitizeHtml } from '../../lib/sanitize-html'

const meta = {
  title: 'Forms/Controls/RichTextEditor',
  component: RichTextEditor,
  args: { 'aria-label': 'Biography' },
} satisfies Meta<typeof RichTextEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { value: '<p>A wandering <strong>bard</strong> with an <em>uncertain</em> past.</p>' },
}

/** Opt in to links with the `linkable` prop (off by default). */
export const Linkable: Story = {
  args: {
    linkable: true,
    value: '<p>See the <a href="https://example.com">tavern notice</a>.</p>',
  },
}

export const ErrorState: Story = {
  args: { 'aria-invalid': true, value: '<p>Needs more detail.</p>' },
}

export const Disabled: Story = {
  args: { disabled: true, value: '<p>Locked entry.</p>' },
  // The disabled editor fades its text via `opacity-50`; WCAG 2.2 SC 1.4.3
  // exempts disabled/inactive components from contrast minimums, so scope the
  // color-contrast check off for this state only (mirrors the unit tests).
  parameters: { a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } } },
}

/** Round-trips edits and renders the stored HTML via the `sanitizeHtml` helper. */
export const WithSanitizedPreview: StoryObj = {
  render: () => {
    const [html, setHtml] = useState('<p>Edit me, then see the sanitized preview below.</p>')
    return (
      <div className="space-y-4">
        <RichTextEditor aria-label="Biography" value={html} onChange={setHtml} />
        <div
          className="rounded-md border border-border p-3 text-sm"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
        />
      </div>
    )
  },
}
