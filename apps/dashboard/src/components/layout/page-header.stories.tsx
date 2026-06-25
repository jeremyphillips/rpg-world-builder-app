import { Link } from 'react-router-dom'
import { buttonVariants } from '@rpg/ui'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { PageHeader } from './page-header'

const meta = {
  title: 'Layout/PageHeader',
  component: PageHeader,
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj

export const TitleOnly: Story = {
  args: { heading: 'Profile' },
}

export const WithActions: Story = {
  args: {
    heading: 'Species',
    actions: (
      <Link to="/new" className={buttonVariants({ size: 'sm' })}>
        New
      </Link>
    ),
  },
}
