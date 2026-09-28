import type { Meta, StoryObj } from '@storybook/react-vite'

import { DetailRowLeadingAvatar } from '../detail-row-leading-avatar'
import { DetailRowLeadingMedia } from '../detail-row-leading-media'

const meta = {
  title: 'Content/Detail/DetailRowLeadingMedia',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj

export const OversizedImageInBoxFrame: Story = {
  render: () => (
    <DetailRowLeadingMedia shape="box" size="xs">
      <img
        alt="Oversized sample"
        src="https://picsum.photos/2400/2400"
        width={2400}
        height={2400}
      />
    </DetailRowLeadingMedia>
  ),
}

export const MemberAvatarCircle: Story = {
  render: () => <DetailRowLeadingAvatar name="Player One" src="https://picsum.photos/2400/2400" />,
}
