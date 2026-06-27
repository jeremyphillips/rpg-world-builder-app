import type { Meta, StoryObj } from '@storybook/react-vite'

import { TypographyCompositeCatalog } from './typography-composite-catalog'

const meta = {
  title: 'Typography/Composites',
  component: TypographyCompositeCatalog,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof TypographyCompositeCatalog>

export default meta
type Story = StoryObj<typeof meta>

export const Catalog: Story = {}
