import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN } from '../../../classes/lib/class-feature-form-labels'
import type { MasterDetailListItem } from '../master-detail-list-panel'
import { NestedResourceMasterDetailEditor } from '../nested-resource-master-detail-editor'

const stubItems: MasterDetailListItem[] = [
  {
    id: 'f1',
    title: 'Champion',
    meta: { sourceLabel: 'System' },
    deletable: false,
  },
  {
    id: 'f2',
    title: 'Battle Master',
    meta: { eyebrow: 'Modified', sourceLabel: 'Homebrew' },
    deletable: true,
  },
]

function EditorStory({ items = stubItems }: { items?: MasterDetailListItem[] }) {
  const [selectedRowId, setSelectedRowId] = useState<string | null>(items[0]?.id ?? null)

  const selectedItem = items.find((item) => item.id === selectedRowId)

  return (
    <NestedResourceMasterDetailEditor
      items={items}
      selectedRowId={selectedRowId}
      onSelectRow={setSelectedRowId}
      onAdd={() => undefined}
      listTitle="Subclasses"
      ariaLabel="Subclasses"
      addLabel="Add subclass"
      itemNoun={CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN}
      selectedIdentity={
        selectedItem
          ? {
              title: selectedItem.title,
              meta: selectedItem.meta,
              deletable: selectedItem.deletable,
            }
          : undefined
      }
      onDelete={() => undefined}
      renderDetail={({ rowId }) => (
        <p className="text-sm text-muted-foreground">Detail body for {rowId}</p>
      )}
    />
  )
}

const meta = {
  title: 'Content/NestedResourceMasterDetailEditor',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj

export const WithRows: Story = {
  render: () => <EditorStory />,
}

export const Empty: Story = {
  render: () => <EditorStory items={[]} />,
}
