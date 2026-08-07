import type { Meta, StoryObj } from '@storybook/react-vite'

import { DetailEntityRow } from './detail-entity-row.client'
import { DetailOverflowMenu } from './detail-overflow-menu.client'
import { DetailSectionRowList } from './detail-section-row-list.client'

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
    href: '/campaigns/demo/locations/silver-eel',
    headingSuffix: ' · Building · Tavern',
  },
}

export const WithOverflow: Story = {
  render: () => (
    <DetailSectionRowList>
      <DetailEntityRow
        heading="The Silver Eel"
        href="/campaigns/demo/locations/silver-eel"
        headingSuffix=" · Building · Tavern"
        endSlot={
          <DetailOverflowMenu
            triggerLabel="Actions for The Silver Eel"
            actions={[
              { id: 'view', label: 'View location', onSelect: () => undefined },
              { id: 'move', label: 'Move location', onSelect: () => undefined },
            ]}
          />
        }
      />
      <DetailEntityRow
        heading="Thieves' Guildhouse"
        href="/campaigns/demo/locations/guildhouse"
        headingSuffix=" · Building · Guildhall"
        endSlot={
          <DetailOverflowMenu
            triggerLabel="Actions for Thieves' Guildhouse"
            actions={[
              { id: 'view', label: 'View location', onSelect: () => undefined },
              { id: 'move', label: 'Move location', onSelect: () => undefined },
            ]}
          />
        }
      />
    </DetailSectionRowList>
  ),
}
