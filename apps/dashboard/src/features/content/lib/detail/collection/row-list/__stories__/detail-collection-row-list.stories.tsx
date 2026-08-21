import type { Meta, StoryObj } from '@storybook/react-vite'

import { DetailEntityRow } from '../../../row/entity/detail-entity-row'
import { DetailCollectionRowList } from '../detail-collection-row-list'

const meta = {
  title: 'Content/Detail/DetailCollectionRowList',
  component: DetailCollectionRowList,
} satisfies Meta<typeof DetailCollectionRowList>

export default meta
type Story = StoryObj<typeof DetailCollectionRowList>

export const StructuralSeparators: Story = {
  render: () => (
    <DetailCollectionRowList separator="structural">
      <DetailEntityRow inset="parent" heading="Dock Ward" headingSuffix="·District" />
      <DetailEntityRow inset="parent" heading="Market Ward" headingSuffix="·District" />
    </DetailCollectionRowList>
  ),
}

export const RecordSeparators: Story = {
  render: () => (
    <DetailCollectionRowList separator="record">
      <ul>
        <li>
          <DetailEntityRow inset="parent" heading="Harborford" />
        </li>
        <li>
          <DetailEntityRow inset="parent" heading="Greymoor" />
        </li>
      </ul>
    </DetailCollectionRowList>
  ),
}
