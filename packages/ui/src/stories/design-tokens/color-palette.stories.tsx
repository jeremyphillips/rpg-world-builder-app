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

/** Full token catalog grouped by role. */
export const Palette: Story = {
  render: () => <ColorPaletteCatalog />,
}

/** Swatches layered on background, card, muted, accent, primary, and destructive-subtle planes. */
export const OnSurfaces: Story = {
  render: () => <ColorOnSurfacesCatalog />,
}

/** Light theme snapshot — pin `globals.theme` for visual regression or design review. */
export const Light: Story = {
  globals: { theme: 'light' },
  render: () => <ColorPaletteCatalog />,
}

/** Dark theme snapshot. */
export const Dark: Story = {
  globals: { theme: 'dark' },
  render: () => <ColorPaletteCatalog />,
}

/** On-surface matrix in dark mode. */
export const OnSurfacesDark: Story = {
  globals: { theme: 'dark' },
  render: () => <ColorOnSurfacesCatalog />,
}
