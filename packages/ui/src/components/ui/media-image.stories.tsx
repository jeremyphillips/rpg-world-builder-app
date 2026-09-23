import type { Meta, StoryObj } from '@storybook/react-vite'

import { MediaImage } from './media-image.client'

const meta = {
  title: 'Primitives/MediaImage',
  component: MediaImage,
  args: {
    alt: 'Character portrait',
    size: 'lg',
    shape: 'square',
  },
} satisfies Meta<typeof MediaImage>

export default meta
type Story = StoryObj<typeof meta>

export const Loaded: Story = {
  args: {
    src: 'https://picsum.photos/seed/media-image/256/256',
  },
}

export const Placeholder: Story = {
  args: {
    src: undefined,
  },
}

export const ErrorState: Story = {
  args: {
    src: 'https://example.invalid/media-missing.webp',
  },
}

export const DecorativeEmptyAlt: Story = {
  args: {
    src: 'https://picsum.photos/seed/media-decorative/256/256',
    alt: '',
  },
}

export const Circular: Story = {
  args: {
    src: 'https://picsum.photos/seed/media-circle/256/256',
    shape: 'circle',
  },
}
