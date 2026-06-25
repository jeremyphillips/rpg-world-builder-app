import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { RichTextEditor } from './rich-text-editor.client'
import { RichTextContent } from './rich-text-content'
import type { RichTextLinkPickerInternalOption } from './rich-text-link-picker.types'

const demoInternalLinkOptions: RichTextLinkPickerInternalOption[] = [
  {
    id: 'spell-overview',
    title: 'Spell Overview',
    href: '/campaigns/demo/content/spells',
    contentType: 'spell',
    kind: 'overview',
  },
  {
    id: 'fireball',
    title: 'Fireball',
    href: '/campaigns/demo/content/spells/fireball',
    contentType: 'spell',
    kind: 'detail',
    sourceLabel: 'Homebrew',
  },
  {
    id: 'sharpshooter',
    title: 'Sharpshooter',
    href: '/campaigns/demo/content/feats/sharpshooter',
    contentType: 'feat',
    kind: 'detail',
  },
]

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

/** Link picker with searchable internal spell/feat targets (dashboard supplies options). */
export const LinkableWithInternalLinks: Story = {
  args: {
    linkable: true,
    internalLinkOptions: demoInternalLinkOptions,
    value:
      '<p>See <a href="/campaigns/demo/content/spells/fireball" data-content-type="spell" data-content-id="fireball" data-content-title="Fireball" data-link-kind="detail">Fireball</a> for details.</p>',
  },
}

export const WithLists: Story = {
  args: {
    value:
      '<ul><li>Pack bedroll and rations.</li><li>Memorize the marching song.</li></ul><ol><li>Reach the pass before dusk.</li></ol>',
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

/** Round-trips edits and renders the stored HTML via `RichTextContent`. */
export const WithSanitizedPreview: StoryObj = {
  render: () => {
    const [html, setHtml] = useState('<p>Edit me, then see the sanitized preview below.</p>')
    return (
      <div className="space-y-4">
        <RichTextEditor aria-label="Biography" value={html} onChange={setHtml} />
        <div className="rounded-md border border-border p-3">
          <RichTextContent html={html} size="sm" />
        </div>
      </div>
    )
  },
}
