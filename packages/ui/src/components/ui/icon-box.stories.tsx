import type { Meta, StoryObj } from '@storybook/react-vite'
import { Table2 } from 'lucide-react'

import { IconBox } from './icon-box.client'

const meta = {
  title: 'UI/IconBox',
  component: IconBox,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof IconBox>

export default meta
type Story = StoryObj<typeof meta>

export const TableIcon: Story = {
  args: {
    children: <Table2 aria-hidden />,
  },
}
