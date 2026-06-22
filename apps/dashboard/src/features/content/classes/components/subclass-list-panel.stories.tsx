import type { Meta, StoryObj } from '@storybook/react-vite'

import { SUBCLASSES_FOR_FIGHTER } from '../fixtures'
import { SubclassListPanel } from './subclass-list-panel.client'

const meta = {
  title: 'Content/Classes/SubclassListPanel',
  component: SubclassListPanel,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SubclassListPanel>

export default meta
type Story = StoryObj<typeof meta>

const items = SUBCLASSES_FOR_FIGHTER.map((subclass) => ({
  id: subclass.id,
  name: subclass.name,
  source: subclass.source,
  classId: subclass.classId,
}))

export const Default: Story = {
  args: {
    items,
    selectedId: items[0]?.id ?? null,
    activeById: {},
    modifiedIds: new Set<string>(),
    onSelect: () => {},
    onAdd: () => {},
    onDeleteRequest: () => {},
  },
}

export const WithInactiveAndModified: Story = {
  args: {
    items,
    selectedId: items[0]?.id ?? null,
    activeById: { [items[0]!.id]: false },
    modifiedIds: new Set([items[0]!.id]),
    onSelect: () => {},
    onAdd: () => {},
    onDeleteRequest: () => {},
  },
}
