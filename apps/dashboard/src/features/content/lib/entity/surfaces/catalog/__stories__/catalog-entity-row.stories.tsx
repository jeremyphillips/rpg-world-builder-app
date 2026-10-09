import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Button, Text } from '@rpg/ui'

import { CatalogEntityRow } from '../catalog-entity-row'
import { CatalogEntityPickerSheet } from '../catalog-entity-picker-sheet'
import { createCatalogEntityRowRenderer } from '../catalog-entity-row-renderer'

const meta = {
  title: 'Content/Entity/CatalogEntityRow',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const domIds = {
  itemId: 'catalog-row-demo',
  titleId: 'catalog-row-demo-title',
  bodyId: 'catalog-row-demo-body',
}

export const FlatAndDisclosureRhythm: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-2">
      <CatalogEntityRow
        toolbarLabel="City Guard"
        domIds={{ ...domIds, itemId: 'flat-row' }}
        entity={{ heading: 'City Guard', classification: 'Government' }}
        trailing={{ kind: 'action', content: <Button type="button">Select</Button> }}
      />
      <CatalogEntityRow
        toolbarLabel="Wooden Staff"
        domIds={{ ...domIds, itemId: 'disclosure-row' }}
        collapsible
        entity={{
          heading: 'Wooden Staff',
          classification: 'Adventuring Gear',
          description: 'Druidic Focus · 4 lb',
        }}
        trailing={{ kind: 'action', content: <Button type="button">Add</Button> }}
        details={<p className="text-sm text-muted-foreground">Spellcasting focus</p>}
      />
    </div>
  ),
}

type DemoOrganization = {
  id: string
  name: string
  classification: string
  note?: string
}

const locationPickerOrganizations: DemoOrganization[] = [
  { id: 'city-bank', name: 'City Bank', classification: 'Commercial' },
  {
    id: 'city-guard',
    name: 'City Guard',
    classification: 'Government',
    note: 'Territorial authority already linked.',
  },
  { id: 'druids-circle', name: "Druids' Circle", classification: 'Religious' },
  { id: 'warriors', name: 'The Warriors', classification: 'Military' },
  { id: 'thieves-guild', name: "Thieves' Guild", classification: 'Criminal' },
]

export const LocationPickerDrawerContext: Story = {
  render: () => (
    <CatalogEntityPickerSheet
      open
      onOpenChange={() => undefined}
      title="Add controlling organization"
      items={locationPickerOrganizations}
      getItemKey={(item) => item.id}
      getSearchText={(item) => `${item.name} ${item.classification}`}
      searchPlaceholder="Search organizations..."
      renderEntityRow={createCatalogEntityRowRenderer({
        buildEntity: (item) => ({
          heading: item.name,
          classification: item.classification,
          status: item.note ? [{ kind: 'text', label: item.note }] : undefined,
        }),
        buildTrailing: (item) => ({
          kind: 'action',
          content: (
            <Button type="button" size="sm" variant="outline" disabled={Boolean(item.note)}>
              Select
            </Button>
          ),
        }),
      })}
      headerBelowDescription={
        <div className="space-y-4 px-6 pt-5 pb-4">
          <div className="space-y-1">
            <Text as="p" variant="muted">
              Lankhmar · Settlement · City
            </Text>
            <Text as="p" variant="muted">
              Located in Nehwon.
            </Text>
          </div>
          <Text as="p">Choose an organization with effective control of this location.</Text>
        </div>
      }
    />
  ),
  parameters: { layout: 'fullscreen' },
}

export const DisclosureToggle: Story = {
  render: function DisclosureToggleStory() {
    const [collapsed, setCollapsed] = useState(true)

    return (
      <div className="max-w-xl">
        <CatalogEntityRow
          toolbarLabel="Sprig of Mistletoe"
          domIds={domIds}
          collapsible
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((value) => !value)}
          entity={{
            heading: 'Sprig of Mistletoe',
            classification: 'Adventuring Gear',
            description: 'Druidic Focus · 0 lb',
          }}
          trailing={{ kind: 'action', content: <Button type="button">Add</Button> }}
          details={<p className="text-sm text-muted-foreground">Spellcasting focus</p>}
        />
      </div>
    )
  },
}

/** Warning text status renders as its own line under the description. */
export const WarningStatusText: Story = {
  render: () => (
    <div className="max-w-xl">
      <CatalogEntityRow
        toolbarLabel="Greatsword"
        domIds={{ ...domIds, itemId: 'warning-row' }}
        entity={{
          heading: 'Greatsword',
          classification: 'Martial weapon',
          description: '2 total · Fighter package ×1',
          status: [{ kind: 'text', variant: 'warning', label: 'Not proficient with this weapon' }],
        }}
      />
    </div>
  ),
}

const METADATA_STATUS_ROWS = [
  {
    id: 'badge-and-text',
    heading: 'Spellbook',
    status: [
      { kind: 'badge', label: 'Cannot afford', tone: 'destructive', appearance: 'soft' },
      { kind: 'text', variant: 'guidance', label: 'Required by class', title: 'Wizard class' },
      { kind: 'text', variant: 'guidance', label: 'Included in package option' },
    ],
  },
  {
    id: 'two-badges',
    heading: 'Greataxe',
    status: [
      { kind: 'badge', label: 'Cannot afford', tone: 'destructive', appearance: 'soft' },
      { kind: 'badge', label: 'Not proficient', tone: 'warning', appearance: 'soft' },
    ],
  },
  {
    id: 'text-only',
    heading: 'Dagger',
    status: [
      { kind: 'text', variant: 'guidance', label: 'Recommended by class', title: 'Wizard class' },
      { kind: 'text', variant: 'guidance', label: 'Included in package option' },
    ],
  },
] as const

/** Selection rows join severity badges and guidance text on one metadata line. */
export const MetadataStatusComposition: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-2">
      {METADATA_STATUS_ROWS.map((row) => (
        <CatalogEntityRow
          key={row.id}
          toolbarLabel={row.heading}
          domIds={{ ...domIds, itemId: `metadata-${row.id}` }}
          entity={{
            heading: row.heading,
            classification: 'Equipment',
            status: row.status,
            statusComposition: 'metadata',
          }}
          trailing={{ kind: 'action', content: <Button type="button">Add</Button> }}
        />
      ))}
    </div>
  ),
}

/** Narrow width — the metadata line wraps between items, not inside badges. */
export const MetadataStatusNarrowWrap: Story = {
  render: () => (
    <div className="w-64">
      <CatalogEntityRow
        toolbarLabel="Plate Armor"
        domIds={{ ...domIds, itemId: 'metadata-narrow' }}
        entity={{
          heading: 'Plate Armor',
          classification: 'Heavy armor',
          status: [
            { kind: 'badge', label: 'Cannot afford', tone: 'destructive', appearance: 'soft' },
            { kind: 'badge', label: 'Not proficient', tone: 'warning', appearance: 'soft' },
            { kind: 'badge', label: 'Requires STR 15', tone: 'warning', appearance: 'soft' },
            { kind: 'text', variant: 'guidance', label: 'Included in package option' },
          ],
          statusComposition: 'metadata',
        }}
      />
    </div>
  ),
}
