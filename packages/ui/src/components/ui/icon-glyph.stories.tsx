import { Icon } from './icon/icon'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from './text'

import { ICON_GLYPH_STEPS, iconGlyphDescendantClasses } from './icon-glyph.variants'
import type { IconSize } from './icon/icon.types'

const GLYPH_STEP_ICON_SIZE = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  '3xl': '3xl',
} as const satisfies Record<(typeof ICON_GLYPH_STEPS)[number], IconSize>

const meta = {
  title: 'Design tokens/Icon glyph',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const RootUtilities: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      {ICON_GLYPH_STEPS.map((step) => (
        <div key={step} className="flex flex-col items-center gap-2">
          <Icon name="check" size={GLYPH_STEP_ICON_SIZE[step]} />
          <span className="text-style-caption">{step}</span>
        </div>
      ))}
    </div>
  ),
}

export const DescendantUtilities: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      {ICON_GLYPH_STEPS.map((step) => (
        <div key={step} className={iconGlyphDescendantClasses[step]}>
          <Icon name="info" size="2xl" />
          <span className="ml-2 text-style-caption">{step}</span>
        </div>
      ))}
    </div>
  ),
}

export const NestedInlineInheritance: Story = {
  render: () => (
    <div className="text-base">
      Base <Icon name="check" size="inline" className="size-icon-inline" />
      <span className="text-xs">
        Small <Icon name="check" size="inline" className="size-icon-inline" />
      </span>
    </div>
  ),
}

export const DecorativeXsPolicy: Story = {
  render: () => (
    <Text variant="caption" className="flex items-center gap-1">
      <span className={iconGlyphDescendantClasses.xs}>
        <Icon name="triangle-alert" size="2xl" />
      </span>
      xs is for tertiary/decorative leading icons — not icon-button glyphs
    </Text>
  ),
}
