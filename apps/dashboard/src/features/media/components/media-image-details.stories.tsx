import type { Meta, StoryObj } from '@storybook/react-vite'
import { getContentMediaPolicy } from '@rpg/contracts'
import { MediaImageDetails } from './media-image-details'
import { mediaFixture, mediaFixtureAssets } from '../fixtures'
const meta = {
  title: 'Features/Media/ImageDetails',
  component: MediaImageDetails,
  args: {
    image: mediaFixture.images[0]!,
    asset: mediaFixtureAssets[0]!,
    media: mediaFixture,
    policy: getContentMediaPolicy('character'),
    onAlt: () => {},
    onRole: () => {},
    onRemove: () => {},
  },
} satisfies Meta<typeof MediaImageDetails>
export default meta
type Story = StoryObj<typeof meta>
export const Character: Story = {}
export const TooSmall: Story = {
  args: { asset: { ...mediaFixtureAssets[0]!, orientedWidth: 64, orientedHeight: 64 } },
}
