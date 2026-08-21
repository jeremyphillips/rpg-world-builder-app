import type { Meta, StoryObj } from '@storybook/react-vite'

import { DetailEntityRow } from '../../../row/entity/detail-entity-row.client'
import { DetailCollectionGroup } from '../detail-collection-group.client'
import { DetailCollectionPanel } from '../../panel/detail-collection-panel.client'
import { DetailCollectionRowList } from '../../row-list/detail-collection-row-list.client'

const meta = {
  title: 'Content/Detail/DetailCollectionGroup',
  component: DetailCollectionGroup,
} satisfies Meta<typeof DetailCollectionGroup>

export default meta
type Story = StoryObj<typeof DetailCollectionGroup>

/** Subgroup labels use Eyebrow size="sm" (title-case copy; CSS uppercases). */
export const Default: Story = {
  args: {
    label: 'Districts',
    children: (
      <DetailCollectionRowList separator="structural">
        <DetailEntityRow inset="parent" heading="Dock Ward" headingSuffix="·District" />
      </DetailCollectionRowList>
    ),
  },
}

export const InsidePanel: Story = {
  render: () => (
    <DetailCollectionPanel heading="City structure" headingId="city-structure-heading">
      <DetailCollectionGroup
        label="Districts"
        action={
          <button type="button" className="text-sm">
            Add district
          </button>
        }
      >
        <DetailCollectionRowList separator="structural">
          <DetailEntityRow inset="parent" heading="Dock Ward" headingSuffix="·District" />
        </DetailCollectionRowList>
      </DetailCollectionGroup>
      <DetailCollectionGroup
        label="Direct locations"
        action={
          <button type="button" className="text-sm">
            Add location
          </button>
        }
      >
        <p className="text-sm text-muted-foreground">No direct locations yet.</p>
      </DetailCollectionGroup>
    </DetailCollectionPanel>
  ),
}
