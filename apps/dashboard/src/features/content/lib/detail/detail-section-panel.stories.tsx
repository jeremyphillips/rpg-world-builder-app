import type { Meta, StoryObj } from '@storybook/react-vite'

import { Plus } from 'lucide-react'

import { Button } from '@rpg/ui'

import { DetailSectionPanel } from './detail-section-panel.client'
import { CrossContentRelationshipRow } from '../relationship/cross-content-relationship-row.client'
import { RelationshipContentRow } from '../relationship/relationship-content-row.client'
import { RelationshipFieldGroupRow } from '../relationship/relationship-field-group-row.client'

function GroupAddAction({ label }: { label: string }) {
  return (
    <Button type="button" variant="ghost" size="sm" density="compact">
      <Plus aria-hidden />
      {label}
    </Button>
  )
}

const meta = {
  title: 'Content/Detail/DetailSectionPanel',
  component: DetailSectionPanel,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DetailSectionPanel>

export default meta
type Story = StoryObj<typeof DetailSectionPanel>

export const TerritorialAuthorityPopulated: Story = {
  render: () => (
    <DetailSectionPanel
      heading="Territorial Authority"
      headingId="story-territorial-authority-heading"
      helper="Organizations that govern, control, or claim this location."
    >
      <RelationshipFieldGroupRow eyebrow="Governs">
        <CrossContentRelationshipRow heading="City Council" />
      </RelationshipFieldGroupRow>
      <RelationshipFieldGroupRow
        eyebrow="Controls"
        endSlot={<GroupAddAction label="Add organization" />}
      >
        <RelationshipContentRow emptyLabel="No controlling organization." />
      </RelationshipFieldGroupRow>
      <RelationshipFieldGroupRow eyebrow="Claims" endSlot={<GroupAddAction label="Add claim" />}>
        <RelationshipContentRow emptyLabel="No organizations claim this location." />
      </RelationshipFieldGroupRow>
    </DetailSectionPanel>
  ),
}

export const WithHeaderAction: Story = {
  render: () => (
    <DetailSectionPanel
      heading="Contained locations"
      headingId="story-contained-locations-heading"
      helper="Locations directly within this location."
      headerEndSlot={
        <button type="button" className="text-sm font-medium">
          Add location
        </button>
      }
    >
      <p className="px-4 py-2 text-sm text-muted-foreground">No contained locations yet.</p>
    </DetailSectionPanel>
  ),
}
