import type { Meta, StoryObj } from '@storybook/react-vite'

import { ColorOnSurfacesCatalog, ColorPaletteCatalog } from './color-palette-catalog'

const meta = {
  title: 'Design Tokens/Color Palette',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Living reference for `@rpg/ui` CSS color variables. Use the Storybook theme toolbar to switch light/dark. Source of truth: `packages/ui/src/styles/tokens/` (imported by `globals.css`).',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Palette roles + Layer 2 semantics — switch theme via Storybook toolbar. */
export const Catalog: Story = {
  render: () => <ColorPaletteCatalog />,
}

/** Contrast matrix on background, sunken, card, muted, and sidebar planes. */
export const OnSurfaces: Story = {
  render: () => <ColorOnSurfacesCatalog />,
}
