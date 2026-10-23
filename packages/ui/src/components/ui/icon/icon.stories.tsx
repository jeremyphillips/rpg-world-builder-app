import type { Meta, StoryObj } from '@storybook/react-vite'

import { Icon } from './icon'
import { ICON_SIZES } from './icon.types'

const meta = {
  title: 'Primitives/Icon',
  component: Icon,
  parameters: { layout: 'centered' },
  args: {
    name: 'check',
    size: 'lg',
  },
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {ICON_SIZES.map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Icon name="check" size={size} />
          <span className="text-style-caption">{size}</span>
        </div>
      ))}
    </div>
  ),
}

export const Inline: Story = {
  render: () => (
    <p className="text-sm">
      Inline <Icon name="check" size="inline" />
    </p>
  ),
}

export const Owner: Story = {
  render: () => (
    <div style={{ ['--icon-size' as string]: 'var(--icon-glyph-lg)' }}>
      <Icon name="check" size="owner" />
    </div>
  ),
}
