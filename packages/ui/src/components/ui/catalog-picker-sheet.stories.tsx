import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Badge } from './badge'
import { Button } from './button.client'
import { CatalogPickerSheet } from './catalog-picker-sheet.client'
import { PreviewCard } from './preview-card.client'
import { Text } from './text'

type DemoItem = {
  id: string
  name: string
  group: 'featured' | 'catalog'
  summary: string
  details: string
}

const demoItems: DemoItem[] = [
  {
    id: 'alpha',
    name: 'Alpha Lantern',
    group: 'featured',
    summary: 'Bright light, 30 ft radius',
    details: 'A hooded brass lantern fueled by oil.',
  },
  {
    id: 'beta',
    name: 'Beta Rope',
    group: 'catalog',
    summary: '50 feet of hempen rope',
    details: 'Standard adventuring rope with a knotted end.',
  },
  {
    id: 'gamma',
    name: 'Gamma Cloak',
    group: 'featured',
    summary: 'Traveler’s cloak',
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
    getItemTab: (item) => item.group,
    defaultTabId: 'featured',
    tabs: [
      { id: 'featured', label: 'Featured' },
      { id: 'catalog', label: 'All' },
    ],
    renderItem: (item) => (
      <PreviewCard
        title={item.name}
        description={item.summary}
        tone="transparent"
        density="compact"
        endSlot={
          <Button type="button" size="sm" variant="outline">
            Add
          </Button>
        }
      />
    ),
    renderItemDetails: (item) => <p>{item.details}</p>,
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
          filters={
            <Text variant="muted" className="text-sm">
              Filters render here without the shell interpreting them.
            </Text>
          }
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
    renderItem: () => null,
    loading: true,
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
    renderItem: () => null,
    emptyState: (
      <div className="rounded-md border border-dashed p-8 text-center">
        <Badge variant="secondary">Custom empty state</Badge>
      </div>
    ),
  },
}
