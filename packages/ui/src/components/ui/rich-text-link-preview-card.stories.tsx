import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { RichTextLinkPreviewCard } from './rich-text-link-preview-card.client'

const meta = {
  title: 'UI/RichTextLinkPreviewCard',
  component: RichTextLinkPreviewCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RichTextLinkPreviewCard>

export default meta
type Story = StoryObj<typeof meta>

export const ResultRow: Story = {
  args: {
    contentType: 'spell',
    title: 'Fireball',
    sourceLabel: 'Homebrew',
    interactive: true,
    onSelect: action('onSelect'),
  },
}

export const SelectedOverview: Story = {
  args: {
    tone: 'selected',
    contentType: 'feat',
    title: 'Feat Overview',
    onClear: action('onClear'),
  },
}

export const FeatDetailResult: Story = {
  args: {
    contentType: 'feat',
    title: 'Sharpshooter',
    interactive: true,
    onSelect: action('onSelect'),
  },
}
