import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'

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

const longItems: MasterDetailListItem[] = Array.from({ length: 20 }, (_, index) => ({
  id: `subclass-${index}`,
  title: `Subclass ${index + 1}`,
  meta: { sourceLabel: 'Homebrew' as const },
  deletable: true,
}))

function EditorStory({
  items = stubItems,
  renderDetail,
}: {
  items?: MasterDetailListItem[]
  renderDetail?: (ctx: { rowId: string }) => ReactNode
}) {
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
      countSupplement={items.length > 5 ? <span>{items.length} available</span> : undefined}
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
      renderDetail={
        renderDetail ??
        (({ rowId }) => <p className="text-sm text-muted-foreground">Detail body for {rowId}</p>)
      }
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

export const LongCollection: Story = {
  render: () => <EditorStory items={longItems} />,
}

export const ConstrainedViewport: Story = {
  render: () => (
    <div className="h-64 [--master-detail-list-max-block-size:12rem]">
      <EditorStory items={longItems} />
    </div>
  ),
}

export const TallerDetailThanRail: Story = {
  render: () => (
    <EditorStory
      renderDetail={() => (
        <div className="space-y-4">
          {Array.from({ length: 16 }, (_, index) => (
            <p key={index} className="text-sm text-muted-foreground">
              Detail paragraph {index + 1} with enough copy to exceed the short list rail height.
            </p>
          ))}
        </div>
      )}
    />
  ),
}

export const Empty: Story = {
  render: () => <EditorStory items={[]} />,
}
