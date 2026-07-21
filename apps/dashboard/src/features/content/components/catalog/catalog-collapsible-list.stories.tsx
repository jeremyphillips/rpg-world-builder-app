import type { Meta, StoryObj } from '@storybook/react-vite'
import { CollapsibleListItem } from '@rpg/ui'

import { CatalogCollapsibleList } from './catalog-collapsible-list.client'

const meta = {
  title: 'Content/Catalog/CatalogCollapsibleList',
  component: CatalogCollapsibleList,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CatalogCollapsibleList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items: [{ id: 'dagger' }, { id: 'shield' }],
    getItemId: (item) => (item as { id: string }).id,
    renderItem: () => null,
  },
  render: () => (
    <CatalogCollapsibleList
      items={[{ id: 'dagger' }, { id: 'shield' }]}
      getItemId={(item) => item.id}
      renderItem={(item) => (
        <CollapsibleListItem
          itemId={item.id}
          toolbarAriaLabel={item.id}
          preset="catalog"
          collapsible
          header={<span className="font-medium capitalize">{item.id}</span>}
          body={<p className="text-sm text-muted-foreground">Expanded details</p>}
        />
      )}
    />
  ),
}
