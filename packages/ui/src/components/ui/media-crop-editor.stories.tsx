import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { resetPortraitCrop, resolveMediaCropEditorConstraint } from '@rpg/contracts'
import { MediaCropEditor, type MediaCropEditorProps } from './media-crop-editor.client'

function Example(args: MediaCropEditorProps) {
  const [crop, setCrop] = useState(args.crop)
  return <MediaCropEditor {...args} crop={crop} onChange={setCrop} />
}

const portraitConstraint = resolveMediaCropEditorConstraint('portrait')!

const meta = {
  title: 'Primitives/MediaCropEditor',
  component: MediaCropEditor,
  render: (args) => <Example {...args} />,
  args: {
    src: 'https://picsum.photos/seed/media-crop/800/600',
    source: { width: 800, height: 600 },
    constraint: portraitConstraint,
    crop: resetPortraitCrop({ width: 800, height: 600 }),
    onChange: () => {},
  },
} satisfies Meta<typeof MediaCropEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Landscape: Story = {}

export const Portrait: Story = {
  args: {
    source: { width: 600, height: 800 },
    crop: resetPortraitCrop({ width: 600, height: 800 }),
    src: 'https://picsum.photos/seed/media-crop/600/800',
  },
}
