import type { Meta, StoryObj } from '@storybook/react-vite'
import { Castle } from 'lucide-react'

import { IdentityFrame } from './identity-frame.client'
import { IDENTITY_FRAME_SIZES } from './identity-frame-tokens.variants'

const meta = {
  title: 'UI/IdentityFrame',
  component: IdentityFrame,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof IdentityFrame>

export default meta
type Story = StoryObj<typeof meta>

export const FallbackSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {IDENTITY_FRAME_SIZES.map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <IdentityFrame size={size} fallback={<Castle aria-hidden />} />
          <span className="text-style-caption">{size}</span>
        </div>
      ))}
    </div>
  ),
}
