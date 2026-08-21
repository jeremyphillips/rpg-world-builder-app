import type { Meta, StoryObj } from '@storybook/react-vite'

import { SUBCLASSES_FOR_FIGHTER } from '../../fixtures'
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
    modifiedIds: new Set<string>(),
    onSelect: () => {},
    onAdd: () => {},
    onDeleteRequest: () => {},
  },
}

export const WithModified: Story = {
  args: {
    items,
    selectedId: items[0]?.id ?? null,
    modifiedIds: new Set([items[0]!.id]),
    onSelect: () => {},
    onAdd: () => {},
    onDeleteRequest: () => {},
  },
}
