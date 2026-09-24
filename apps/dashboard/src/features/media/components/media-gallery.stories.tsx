import type { Meta, StoryObj } from '@storybook/react-vite'
import { MediaGallery } from './media-gallery'
import { mediaFixture, mediaFixtureAssets, mediaFixtureImageUrl } from '../fixtures'

const fixtureAvailable = mediaFixture.images.map((attachment) => ({
  kind: 'upload' as const,
  id: attachment.id,
  attachment,
}))

const meta = {
  title: 'Features/Media/Gallery',
  component: MediaGallery,
  args: {
    imageUrl: mediaFixtureImageUrl,
    media: mediaFixture,
    availableImages: fixtureAvailable,
    assets: Object.fromEntries(mediaFixtureAssets.map((asset) => [asset.id, asset])),
    allowedRoles: ['portrait', 'primary'],
    selectedId: 'image-0',
    entries: [],
    onSelect: () => {},
    onAdd: () => {},
    onRetry: () => {},
    onRemoveUpload: () => {},
  },
} satisfies Meta<typeof MediaGallery>
export default meta
type Story = StoryObj<typeof meta>
export const Selected: Story = {}
export const PartialFailure: Story = {
  args: {
    entries: [
      {
        id: 'upload-1',
        file: new File(['demo'], 'large-image.png'),
        status: 'failed',
        error: 'File exceeds the upload limit.',
      },
      { id: 'upload-2', file: new File(['demo'], 'landscape.jpg'), status: 'uploading' },
    ],
  },
}
