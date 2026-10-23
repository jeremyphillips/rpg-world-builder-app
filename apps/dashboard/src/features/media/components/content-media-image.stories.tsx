import type { Meta, StoryObj } from '@storybook/react-vite'

import { ContentMediaFallback, ContentMediaImage } from './content-media-image'
import type { ContentMediaImageFrame } from './content-media-image.variants'

const FRAMES = [
  'square',
  'insetSm',
  'anatomyFill',
  'builderCard',
  'primary',
  'builderSheetHero',
  'intrinsic',
  'emblem',
  'emblemHero',
] as const satisfies readonly ContentMediaImageFrame[]

const meta = {
  title: 'Features/Media/ContentMediaImage',
  component: ContentMediaFallback,
  parameters: { layout: 'padded' },
  args: {
    fallback: 'spell',
  },
} satisfies Meta<typeof ContentMediaFallback>

export default meta
type Story = StoryObj<typeof meta>

export const Image: Story = {
  args: { fallback: 'spell' },
  render: () => (
    <div className="w-48">
      <ContentMediaImage
        display={{ src: '/fighter.jpeg', role: 'primary', sourceKind: 'system' }}
        alt="Fighter"
        frame="primary"
      />
    </div>
  ),
}

export const FallbackFrames: Story = {
  args: { fallback: 'spell' },
  render: () => (
    <div className="flex flex-wrap items-end gap-4">
      {FRAMES.map((frame) => (
        <div key={frame} className="flex w-40 flex-col gap-2">
          <ContentMediaFallback fallback="spell" frame={frame} />
          <span className="text-style-caption">{frame}</span>
        </div>
      ))}
    </div>
  ),
}
