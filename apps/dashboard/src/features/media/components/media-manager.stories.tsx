import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Button } from '@rpg/ui'
import { MediaManager, type MediaManagerProps } from './media-manager'
import { mediaFixture, mediaFixtureAssets, mediaFixtureImageUrl } from '../fixtures'

function Example(args: MediaManagerProps) {
  const [client] = useState(() => new QueryClient())
  const [open, setOpen] = useState(true)
  const [value, setValue] = useState(args.value)
  return (
    <QueryClientProvider client={client}>
      <Button onClick={() => setOpen(true)}>Manage images</Button>
      <MediaManager
        {...args}
        open={open}
        value={value}
        onOpenChange={setOpen}
        onSave={async (change) => {
          await args.onSave(change)
          setValue(change.media)
        }}
      />
    </QueryClientProvider>
  )
}
const meta = {
  title: 'Features/Media/MediaManager',
  component: MediaManager,
  render: (args) => <Example {...args} />,
  parameters: { layout: 'fullscreen' },
  args: {
    imageUrl: mediaFixtureImageUrl,
    open: true,
    onOpenChange: () => {},
    domain: 'character',
    value: mediaFixture,
    scope: { kind: 'user-pc', userId: 'demo' },
    initialAssets: mediaFixtureAssets,
    mode: 'form',
    onSave: () => {},
  },
} satisfies Meta<typeof MediaManager>
export default meta
type Story = StoryObj<typeof meta>
export const Character: Story = {}
export const SameSourceBothRoles: Story = {
  args: {
    value: {
      ...mediaFixture,
      roles: { primary: { imageId: 'image-0' }, portrait: { imageId: 'image-0' } },
    },
  },
}
const primaryValue = { ...mediaFixture, roles: { primary: { imageId: 'image-1' } } }
export const Class: Story = { args: { domain: 'class', value: primaryValue } }
export const Species: Story = { args: { domain: 'species', value: primaryValue } }
export const Equipment: Story = { args: { domain: 'equipment', value: primaryValue } }
export const Location: Story = { args: { domain: 'location', value: primaryValue } }
export const Organization: Story = { args: { domain: 'organization', value: primaryValue } }
export const Empty: Story = { args: { value: { revision: 0, images: [], roles: {} } } }

/** Static preview of the transparent body drop overlay (valid files). */
export const EmptyBodyDropActive: Story = {
  args: {
    value: { revision: 0, images: [], roles: {} },
    previewBodyDrop: 'active',
  },
}

/** Static preview when dragged files are outside the accept list. */
export const EmptyBodyDropInvalid: Story = {
  args: {
    value: { revision: 0, images: [], roles: {} },
    previewBodyDrop: 'invalid',
  },
}

export const Unassigned: Story = { args: { value: { ...mediaFixture, roles: {} } } }
export const FailedSave: Story = {
  args: {
    mode: 'detail',
    onSave: () => {
      throw new Error('The record changed elsewhere. Reload the record before saving again.')
    },
  },
}
export const Mobile: Story = { globals: { viewport: { value: 'mobile1', isRotated: false } } }
