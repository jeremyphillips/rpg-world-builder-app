import type { Meta, StoryObj } from '@storybook/react-vite'

import { DetailCollectionPanel } from '../detail-collection-panel.client'
import { RelationshipList } from '../../../../relationship/list/relationship-list.client'

const meta = {
  title: 'Content/Detail/DetailCollectionPanel',
  component: DetailCollectionPanel,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DetailCollectionPanel>

export default meta
type Story = StoryObj<typeof DetailCollectionPanel>

export const WithRelationshipBody: Story = {
  render: () => (
    <DetailCollectionPanel
      heading="Territorial Authority"
      headingId="story-territorial-authority-heading"
      helper="Organizations that govern, control, or claim this location."
    >
      <RelationshipList.Root itemCount={1}>
        <RelationshipList.Group itemCount={1} label="Governs">
          <RelationshipList.Row title="City Council" />
        </RelationshipList.Group>
      </RelationshipList.Root>
    </DetailCollectionPanel>
  ),
}

export const WithPanelAction: Story = {
  render: () => (
    <DetailCollectionPanel
      heading="Contained locations"
      headingId="story-contained-locations-heading"
      helper="Locations directly within this location."
      action={
        <button type="button" className="text-sm font-medium">
          Add location
        </button>
      }
    >
      <p className="px-4 py-2 text-sm text-muted-foreground">No contained locations yet.</p>
    </DetailCollectionPanel>
  ),
}
