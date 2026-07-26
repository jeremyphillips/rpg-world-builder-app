import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import {
  DataTableColumnsMenu,
  type DataTableColumnsMenuItem,
} from './data-table-columns-menu.client'

const INITIAL_ITEMS: DataTableColumnsMenuItem[] = [
  { id: 'name', label: 'Name', visible: true, canHide: false, lockedReason: 'Always visible' },
  { id: 'type', label: 'Type', visible: true, canHide: true },
  { id: 'source', label: 'Source', visible: false, canHide: true },
]

function ColumnsMenuDemo() {
  const [items, setItems] = useState(INITIAL_ITEMS)

  return (
    <DataTableColumnsMenu
      items={items}
      onVisibilityChange={(id, visible) => {
        setItems((current) => current.map((item) => (item.id === id ? { ...item, visible } : item)))
      }}
      onReorder={(activeId, overId) => {
        setItems((current) => {
          const hideable = current.filter((item) => item.canHide)
          const locked = current.filter((item) => !item.canHide)
          const oldIndex = hideable.findIndex((item) => item.id === activeId)
          const newIndex = hideable.findIndex((item) => item.id === overId)
          if (oldIndex < 0 || newIndex < 0) return current
          const nextHideable = [...hideable]
          const [moved] = nextHideable.splice(oldIndex, 1)
          nextHideable.splice(newIndex, 0, moved!)
          return [...locked, ...nextHideable]
        })
      }}
      onReset={() => setItems(INITIAL_ITEMS)}
    />
  )
}

const meta = {
  title: 'Components/DataTableColumnsMenu',
  component: ColumnsMenuDemo,
} satisfies Meta<typeof ColumnsMenuDemo>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <ColumnsMenuDemo />,
}
