import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { Avatar } from './avatar.client'
import { AVATAR_CLASS_SPECS } from './avatar.styles'

const meta = {
  title: 'Primitives/Avatar',
  component: Avatar,
  args: {
    name: 'Ada Lovelace',
    size: 'md',
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Initials: Story = {}

export const Image: Story = {
  args: {
    src: 'https://i.pravatar.cc/80?img=5',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar name="Small Example" size="sm" />
      <Avatar name="Medium Example" size="md" />
      <Avatar name="Large Example" size="lg" />
    </div>
  ),
}

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => (
    <ClassReferenceTable
      rows={AVATAR_CLASS_SPECS.map((spec) => ({
        key: spec.key,
        sample: (
          <span data-semantic-class-target className={spec.className}>
            AL
          </span>
        ),
        propsLabel: spec.key,
        className: spec.className,
        keyValues: spec.keyValues,
        useCase: spec.useCase,
      }))}
    />
  ),
}
