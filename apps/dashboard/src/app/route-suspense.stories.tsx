import { Text } from '@rpg/ui'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { RouteSuspense } from './route-suspense'

const meta = {
  title: 'Layout/RouteSuspense',
  component: RouteSuspense,
} satisfies Meta<typeof RouteSuspense>

export default meta
type Story = StoryObj

export const Ready: Story = {
  render: () => (
    <RouteSuspense>
      <Text>Route content</Text>
    </RouteSuspense>
  ),
}
