import type { Meta, StoryObj } from '@storybook/react-vite'

import { DetailEntityRow } from './detail-entity-row.client'
import { DetailOverflowMenu } from './detail-overflow-menu.client'
import { DetailSectionRowList } from '../section/detail-section-row-list.client'

const meta = {
  title: 'Content/Detail/DetailEntityRow',
  component: DetailEntityRow,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DetailEntityRow>

export default meta
type Story = StoryObj<typeof DetailEntityRow>

export const Default: Story = {
  args: {
    heading: 'The Silver Eel',
    headingHref: '/campaigns/demo/locations/silver-eel',
    headingSuffix: ' · Building · Tavern',
  },
}

export const WithOverflow: Story = {
  render: () => (
    <DetailSectionRowList separator="structural">
      <DetailEntityRow
        heading="The Silver Eel"
        headingHref="/campaigns/demo/locations/silver-eel"
        headingSuffix=" · Building · Tavern"
        trailing={{
          kind: 'action',
          content: (
            <DetailOverflowMenu
              triggerLabel="Actions for The Silver Eel"
              actions={[
                { id: 'view', label: 'View location', onSelect: () => undefined },
                { id: 'move', label: 'Move location', onSelect: () => undefined },
              ]}
            />
          ),
        }}
      />
      <DetailEntityRow
        heading="Thieves' Guildhouse"
        headingHref="/campaigns/demo/locations/guildhouse"
        headingSuffix=" · Building · Guildhall"
        trailing={{
          kind: 'action',
          content: (
            <DetailOverflowMenu
              triggerLabel="Actions for Thieves' Guildhouse"
              actions={[
                { id: 'view', label: 'View location', onSelect: () => undefined },
                { id: 'move', label: 'Move location', onSelect: () => undefined },
              ]}
            />
          ),
        }}
      />
    </DetailSectionRowList>
  ),
}

export const WithDisclosure: Story = {
  render: () => (
    <DetailSectionRowList separator="structural">
      <DetailEntityRow
        heading="Dock Ward"
        headingHref="/campaigns/demo/locations/dock-ward"
        headingSuffix=" · District · 2 locations"
        disclosure={{
          mode: 'expandable',
          label: 'locations in Dock Ward',
          content: (
            <DetailSectionRowList separator="structural">
              <DetailEntityRow
                heading="The Silver Eel"
                headingHref="/campaigns/demo/locations/silver-eel"
                headingSuffix=" · Building · Tavern"
                inset="parent"
              />
              <DetailEntityRow
                heading="Thieves' Guildhouse"
                headingHref="/campaigns/demo/locations/guildhouse"
                headingSuffix=" · Building · Guildhall"
                inset="parent"
              />
            </DetailSectionRowList>
          ),
        }}
        trailing={{
          kind: 'action',
          content: (
            <DetailOverflowMenu
              triggerLabel="Actions for Dock Ward"
              actions={[
                { id: 'view', label: 'View location', onSelect: () => undefined },
                { id: 'move', label: 'Move location', onSelect: () => undefined },
              ]}
            />
          ),
        }}
      />
      <DetailEntityRow
        heading="Scholar's Quarter"
        headingHref="/campaigns/demo/locations/scholars-quarter"
        headingSuffix=" · District · 0 locations"
        disclosure={{ mode: 'reserved' }}
      />
    </DetailSectionRowList>
  ),
}
