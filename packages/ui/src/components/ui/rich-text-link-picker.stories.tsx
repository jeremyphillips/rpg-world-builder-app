import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Button } from './button.client'
import { RichTextLinkPicker } from './rich-text-link-picker.client'

const demoInternalOptions = [
  {
    id: 'spell-overview',
    title: 'Spell Overview',
    href: '/campaigns/demo/content/spells',
    contentType: 'spell',
    kind: 'overview' as const,
  },
  {
    id: 'fireball',
    title: 'Fireball',
    href: '/campaigns/demo/content/spells/fireball',
    contentType: 'spell',
    kind: 'detail' as const,
    sourceLabel: 'Homebrew',
  },
  {
    id: 'feat-overview',
    title: 'Feat Overview',
    href: '/campaigns/demo/content/feats',
    contentType: 'feat',
    kind: 'overview' as const,
  },
  {
    id: 'sharpshooter',
    title: 'Sharpshooter',
    href: '/campaigns/demo/content/feats/sharpshooter',
    contentType: 'feat',
    kind: 'detail' as const,
  },
]

const meta = {
  title: 'UI/RichTextLinkPicker',
  component: RichTextLinkPicker,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof RichTextLinkPicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true)
    return (
      <div className="min-h-[24rem] min-w-[32rem] p-4">
        <RichTextLinkPicker
          open={open}
          onOpenChange={setOpen}
          onInsert={action('onInsert')}
          onCancel={action('onCancel')}
          onRemove={action('onRemove')}
          internalOptions={demoInternalOptions}
          trigger={<Button type="button">Link</Button>}
        />
      </div>
    )
  },
}
