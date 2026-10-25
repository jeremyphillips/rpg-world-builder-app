import type { Meta, StoryObj } from '@storybook/react-vite'

import { TypographyScaleCatalog } from './typography-scale-catalog'

const meta = {
  title: 'Typography/Scale',
  component: TypographyScaleCatalog,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof TypographyScaleCatalog>

export default meta
type Story = StoryObj<typeof meta>

export const Catalog: Story = {}
