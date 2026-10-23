import { Icon } from './icon/icon'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconContainer } from './icon-container.client'

const meta = {
  title: 'UI/IconContainer',
  component: IconContainer,
  parameters: { layout: 'centered' },
  args: {
    children: <Icon name="table" size="2xl" />,
  },
} satisfies Meta<typeof IconContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Box: Story = {
  args: {
    shape: 'box',
  },
}

export const Circle: Story = {
  args: {
    shape: 'circle',
  },
}

export const Medium: Story = {
  args: {
    size: 'md',
  },
}
