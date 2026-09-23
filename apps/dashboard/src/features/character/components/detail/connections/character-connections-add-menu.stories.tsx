import type { Meta, StoryObj } from '@storybook/react-vite'

import { CharacterConnectionsAddMenu } from './character-connections-add-menu'

const meta = {
  title: 'Character/Detail/Connections/CharacterConnectionsAddMenu',
  component: CharacterConnectionsAddMenu,
  parameters: { layout: 'centered' },
  args: {
    onSelectSection: () => undefined,
  },
} satisfies Meta<typeof CharacterConnectionsAddMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = {
  args: { disabled: true },
}
