import type { Meta, StoryObj } from '@storybook/react-vite'

import { ActionIcon } from './action-icon.client'
import { ACTION_ICON_VERBS } from './action-icons.map'

const meta = {
  title: 'Primitives/ActionIcon',
  component: ActionIcon,
} satisfies Meta<typeof ActionIcon>

export default meta
type Story = StoryObj<typeof ActionIcon>

export const Verbs: Story = {
  render: () => (
    <ul className="flex flex-wrap gap-4">
      {ACTION_ICON_VERBS.map((action) => (
        <li key={action} className="flex flex-col items-center gap-1 text-xs">
          <ActionIcon action={action} size="lg" />
          <span>{action}</span>
        </li>
      ))}
    </ul>
  ),
}
