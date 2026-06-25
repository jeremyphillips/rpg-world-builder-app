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
  args: {
    open: true,
    onOpenChange: action('onOpenChange'),
    onInsert: action('onInsert'),
    onCancel: action('onCancel'),
    onRemove: action('onRemove'),
    internalOptions: demoInternalOptions,
    trigger: <Button type="button">Link</Button>,
  },
  render: (args) => {
    const [open, setOpen] = React.useState(args.open)
    return (
      <div className="min-h-[24rem] min-w-[32rem] p-4">
        <RichTextLinkPicker
          {...args}
          open={open}
          onOpenChange={setOpen}
          trigger={<Button type="button">Link</Button>}
        />
      </div>
    )
  },
}

export const ExternalTab: Story = {
  args: {
    open: true,
    onOpenChange: action('onOpenChange'),
    onInsert: action('onInsert'),
    onCancel: action('onCancel'),
    internalOptions: demoInternalOptions,
    initialValue: {
      mode: 'external',
      href: 'https://example.com/rules',
      displayText: 'House rules',
      openInNewWindow: true,
    },
    trigger: <Button type="button">Link</Button>,
  },
}

export const EditExistingInternalLink: Story = {
  args: {
    open: true,
    onOpenChange: action('onOpenChange'),
    onInsert: action('onInsert'),
    onCancel: action('onCancel'),
    onRemove: action('onRemove'),
    internalOptions: demoInternalOptions,
    initialValue: {
      mode: 'internal',
      href: '/campaigns/demo/content/spells/fireball',
      displayText: 'Fireball spell',
      openInNewWindow: false,
      metadata: {
        contentType: 'spell',
        contentId: 'fireball',
        contentTitle: 'Fireball',
        linkKind: 'detail',
      },
    },
    trigger: <Button type="button">Link</Button>,
  },
}
