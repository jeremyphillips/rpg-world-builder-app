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

/** Alternate acquisition entry between search and results — prefer over footer create buttons. */
export const WithAuxiliaryAction: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    title: 'Add member',
    description: 'Choose a character to add.',
    items: demoItems,
    getItemKey: (item) => item.id,
    getSearchText: (item) => item.name,
    renderItemHeader: (item) => <span>{item.name}</span>,
    auxiliaryAction: {
      state: 'action',
      label: 'Create new NPC',
      onAction: () => undefined,
    },
  },
}

export const WithAuxiliaryActionEmpty: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    title: 'Add member',
    description: 'Choose a character to add.',
    items: [],
    getItemKey: () => 'empty',
    getSearchText: () => '',
    renderItemHeader: () => null,
    noItemsMessage: 'No characters are available.',
    auxiliaryAction: {
      state: 'action',
      label: 'Create new NPC',
      onAction: () => undefined,
    },
  },
}

export const WithAuxiliaryActionUnavailable: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    title: 'Add member',
    description: 'Choose a character to add.',
    items: demoItems,
    getItemKey: (item) => item.id,
    getSearchText: (item) => item.name,
    renderItemHeader: (item) => <span>{item.name}</span>,
    auxiliaryAction: {
      state: 'unavailable',
      message: 'Quick NPC creation is unavailable.',
    },
  },
}

/** Primitive contract: auxiliary acquisition + concluding footer coexist. */
export const AuxiliaryActionWithFooter: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    title: 'Link location',
    description: 'Choose a location to link.',
    items: demoItems,
    getItemKey: (item) => item.id,
    getSearchText: (item) => item.name,
    renderItemHeader: (item) => <span>{item.name}</span>,
    auxiliaryAction: {
      state: 'action',
      label: 'Create location',
      onAction: () => undefined,
    },
    footer: (
      <Button type="button" disabled>
        Link location
      </Button>
    ),
  },
}

/** Inline create flow replacing the picker body — search/tab state stays mounted. */
export const BodyReplacement: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    title: 'Add gear',
    items: demoItems,
    getItemKey: (item) => item.id,
    getSearchText: (item) => item.name,
    renderItemHeader: (item) => <span>{item.name}</span>,
  },
  render: function Render(args) {
    const [view, setView] = useState<'picker' | 'create'>('picker')

    return (
      <CatalogPickerSheet
        {...args}
        title={view === 'picker' ? 'Add gear' : 'Create gear'}
        bodyReplacement={
          view === 'create' ? (
            <div className="flex flex-col gap-4">
              <Text variant="muted">An inline create form renders here.</Text>
              <div>
                <Button type="button" variant="outline" onClick={() => setView('picker')}>
                  Back
                </Button>
              </div>
            </div>
          ) : undefined
        }
        footer={
          view === 'picker' ? (
            <Button type="button" variant="outline" onClick={() => setView('create')}>
              Create new gear
            </Button>
          ) : undefined
        }
      />
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
