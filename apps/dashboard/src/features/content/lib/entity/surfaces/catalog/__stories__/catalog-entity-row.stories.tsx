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
