import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Badge } from './badge'
import { Button } from './button.client'
import { CatalogPickerSheet } from './catalog-picker-sheet.client'
import { Text } from './text'

type DemoItem = {
  id: string
  name: string
  group: 'featured' | 'catalog'
  summary: string
  price: string
  details: string
}

const demoItems: DemoItem[] = [
  {
    id: 'alpha',
    name: 'Alpha Lantern',
    group: 'featured',
    summary: 'Bright light, 30 ft radius',
    price: '5 GP',
    details: 'A hooded brass lantern fueled by oil.',
  },
  {
    id: 'beta',
    name: 'Beta Rope',
    group: 'catalog',
    summary: '50 feet of hempen rope',
    price: '1 GP',
    details: 'Standard adventuring rope with a knotted end.',
  },
  {
    id: 'gamma',
    name: 'Gamma Cloak',
    group: 'featured',
    summary: 'Traveler’s cloak',
    price: '8 GP',
    details: 'A weatherproof wool cloak with deep pockets.',
  },
]

const meta = {
  title: 'Primitives/CatalogPickerSheet',
  component: CatalogPickerSheet<DemoItem>,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CatalogPickerSheet<DemoItem>>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    title: 'Add gear',
    description: 'Search the catalog and expand a row for details.',
    items: demoItems,
    getItemKey: (item) => item.id,
    getSearchText: (item) => `${item.name} ${item.summary}`,
    getItemToolbarLabel: (item) => item.name,
    getItemTab: (item) => item.group,
    defaultTabId: 'featured',
    tabs: [
      { id: 'featured', label: 'Featured' },
      { id: 'catalog', label: 'All' },
    ],
    renderItemHeader: (item) => (
      <span className="truncate text-sm font-medium">{item.name} · Gear</span>
    ),
    renderItemActions: (item) => (
      <div className="flex items-center gap-2">
        <Text as="span" variant="muted" className="tabular-nums shrink-0">
          {item.price}
        </Text>
        <Button type="button" size="sm" variant="outline">
          Add
        </Button>
      </div>
    ),
    renderItemDetails: (item) => <p className="text-sm text-muted-foreground">{item.details}</p>,
  },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open)

    return (
      <>
        <Button className="m-8" onClick={() => setOpen(true)}>
          Open picker
        </Button>
        <CatalogPickerSheet
          {...args}
          open={open}
          onOpenChange={setOpen}
          filterRow={{
            controls: (
              <Text variant="muted" className="text-sm">
                Toolbar controls render here without the shell interpreting them.
              </Text>
            ),
          }}
          footer={<Button onClick={() => setOpen(false)}>Done</Button>}
        />
      </>
    )
  },
}

export const Loading: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    title: 'Loading catalog',
    items: [],
    getItemKey: () => 'loading',
    getSearchText: () => '',
    renderItemHeader: () => null,
  },
}

export const Empty: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    title: 'Empty catalog',
    description: 'No rows are available yet.',
    items: [],
    getItemKey: () => 'empty',
    getSearchText: () => '',
    renderItemHeader: () => null,
    emptyState: (
      <div className="rounded-md border border-dashed p-8 text-center">
        <Badge appearance="neutral" tone="neutral">
          Custom empty state
        </Badge>
      </div>
    ),
  },
}
