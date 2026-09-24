import type { Meta, StoryObj } from '@storybook/react-vite'
import { getContentMediaPolicy } from '@rpg/contracts'
import { MediaImageDetails } from './media-image-details'
import { mediaFixture, mediaFixtureAssets } from '../fixtures'

const uploadAvailable = {
  kind: 'upload' as const,
  id: mediaFixture.images[0]!.id,
  attachment: mediaFixture.images[0]!,
}

const meta = {
  title: 'Features/Media/ImageDetails',
  component: MediaImageDetails,
  args: {
    selectedAvailable: uploadAvailable,
    asset: mediaFixtureAssets[0]!,
    media: mediaFixture,
    policy: getContentMediaPolicy('character'),
    assignedRoles: ['portrait'],
    canRemove: true,
    onAlt: () => {},
    onRole: () => {},
    onRemove: () => {},
  },
} satisfies Meta<typeof MediaImageDetails>
export default meta
type Story = StoryObj<typeof meta>
export const Character: Story = {}
export const TooSmall: Story = {
  args: {
    asset: { ...mediaFixtureAssets[0]!, orientedWidth: 64, orientedHeight: 64 },
    assignedRoles: [],
  },
}
