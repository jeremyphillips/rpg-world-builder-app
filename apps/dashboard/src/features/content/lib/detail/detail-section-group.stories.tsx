import type { Meta, StoryObj } from '@storybook/react-vite'

import { DetailEntityRow } from './detail-entity-row.client'
import { DetailSectionGroup } from './detail-section-group.client'
import { DetailSectionPanel } from './detail-section-panel.client'
import { DetailSectionRowList } from './detail-section-row-list.client'

const meta = {
  title: 'Content/Detail/DetailSectionGroup',
  component: DetailSectionGroup,
} satisfies Meta<typeof DetailSectionGroup>

export default meta
type Story = StoryObj<typeof DetailSectionGroup>

/** Detail-page subgroup labels use Eyebrow size="sm" (title-case copy; CSS uppercases). */
export const Default: Story = {
  args: {
    label: 'Districts',
    children: (
      <DetailSectionRowList separator="structural">
        <DetailEntityRow inset="parent" heading="Dock Ward" headingSuffix="·District" />
      </DetailSectionRowList>
    ),
  },
}

export const InsidePanel: Story = {
  render: () => (
    <DetailSectionPanel heading="City structure" headingId="city-structure-heading">
      <DetailSectionGroup
        label="Districts"
        endSlot={
          <button type="button" className="text-sm">
            Add district
          </button>
        }
      >
        <DetailSectionRowList separator="structural">
          <DetailEntityRow inset="parent" heading="Dock Ward" headingSuffix="·District" />
        </DetailSectionRowList>
      </DetailSectionGroup>
      <DetailSectionGroup
        label="Direct locations"
        endSlot={
          <button type="button" className="text-sm">
            Add location
          </button>
        }
      >
        <p className="text-sm text-muted-foreground">No direct locations yet.</p>
      </DetailSectionGroup>
    </DetailSectionPanel>
  ),
}
