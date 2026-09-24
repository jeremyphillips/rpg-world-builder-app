import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { defaultEmblemPresentation } from '@rpg/contracts'
import { MediaEmblemEditor, type MediaEmblemEditorProps } from './media-emblem-editor.client'

function Example(args: MediaEmblemEditorProps) {
  const [layout, setLayout] = useState(args.layout)
  return <MediaEmblemEditor {...args} layout={layout} onChange={setLayout} />
}

const meta = {
  title: 'Primitives/MediaEmblemEditor',
  component: MediaEmblemEditor,
  render: (args) => <Example {...args} />,
  args: {
    src: 'https://picsum.photos/seed/emblem/512/512',
    layout: defaultEmblemPresentation(),
    onChange: () => {},
  },
} satisfies Meta<typeof MediaEmblemEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
