import type { Meta, StoryObj } from '@storybook/react-vite'
import { Check, Info, TriangleAlert } from 'lucide-react'

import {
  ICON_GLYPH_STEPS,
  iconGlyphDescendantClasses,
  iconGlyphRootClasses,
} from './icon-glyph.variants'

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
          <Check aria-hidden className={iconGlyphRootClasses[step]} />
          <span className="text-xs text-muted-foreground">{step}</span>
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
          <Info aria-hidden />
          <span className="ml-2 text-xs text-muted-foreground">{step}</span>
        </div>
      ))}
    </div>
  ),
}

export const DecorativeXsPolicy: Story = {
  render: () => (
    <p className="flex items-center gap-1 text-xs text-muted-foreground">
      <span className={iconGlyphDescendantClasses.xs}>
        <TriangleAlert aria-hidden />
      </span>
      xs is for tertiary/decorative leading icons — not icon-button glyphs
    </p>
  ),
}
