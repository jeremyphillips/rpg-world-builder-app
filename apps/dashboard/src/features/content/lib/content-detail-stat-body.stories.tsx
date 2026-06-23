import type { Meta, StoryObj } from '@storybook/react-vite'

import { ContentDetailStatBody } from './content-detail-stat-body'

const meta = {
  title: 'Content/ContentDetailStatBody',
  component: ContentDetailStatBody,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContentDetailStatBody>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'Longsword',
    statRows: [
      { label: 'Category', value: 'Martial' },
      { label: 'Damage', value: '1d8 slashing' },
      { label: 'Cost', value: '15 gp' },
    ],
    description: 'A versatile martial weapon favored by knights and adventurers.',
  },
}

export const WithoutDescription: Story = {
  args: {
    name: 'Leather Armor',
    statRows: [
      { label: 'Category', value: 'Light' },
      { label: 'AC', value: '11 + Dex' },
      { label: 'Cost', value: '10 gp' },
    ],
  },
}
