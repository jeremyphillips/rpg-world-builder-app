import type { Meta, StoryObj } from '@storybook/react-vite'

import { MediaCompactPreview } from './media-compact-preview.client'

const presentation = {
  kind: 'rendition' as const,
  preset: 'compact-identity' as const,
  role: 'portrait' as const,
  alt: 'Compact portrait preview',
  attachmentId: 'img-1',
  assetId: 'asset-1',
}

const meta = {
  title: 'Primitives/MediaCompactPreview',
  component: MediaCompactPreview,
  args: {
    presentation,
    src: 'https://picsum.photos/seed/media-compact/128/128',
    variant: 'square',
    size: 'md',
  },
} satisfies Meta<typeof MediaCompactPreview>

export default meta
type Story = StoryObj<typeof meta>

export const Square: Story = {}

export const Circle: Story = {
  args: {
    variant: 'circle',
  },
}

export const Placeholder: Story = {
  args: {
    presentation: {
      kind: 'placeholder',
      preset: 'compact-identity',
      fallbackReason: 'missing-role',
      alt: '',
    },
    src: undefined,
  },
}
