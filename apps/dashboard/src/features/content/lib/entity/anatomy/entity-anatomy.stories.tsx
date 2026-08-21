import type { Meta, StoryObj } from '@storybook/react-vite'

import { ContentEntityCard } from '@/features/content'
import { EntityAnatomyHost } from './entity-anatomy'
import { GREY_COAST_ENTITY, HARBOR_DISTRICT_ENTITY, SILVER_CIRCLE_ENTITY } from '../entity.fixture'

const meta = {
  title: 'Content/Entity/EntityAnatomyHost',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const EmbeddedCompact: Story = {
  render: () => (
    <div className="max-w-md rounded-md border border-border bg-catalog-picker-row-surface">
      <EntityAnatomyHost entity={GREY_COAST_ENTITY} density="compact" />
    </div>
  ),
}

export const EmbeddedWithAction: Story = {
  render: () => (
    <div className="max-w-md rounded-md border border-border bg-catalog-picker-row-surface">
      <EntityAnatomyHost
        entity={HARBOR_DISTRICT_ENTITY}
        density="compact"
        trailing={{
          kind: 'action',
          content: (
            <button type="button" className="text-sm text-link">
              Select
            </button>
          ),
        }}
      />
    </div>
  ),
}

export const ContentEntityCardComfortable: Story = {
  render: () => (
    <div className="max-w-md">
      <ContentEntityCard
        entity={HARBOR_DISTRICT_ENTITY}
        headingHref="/campaigns/demo/locations/harbor"
      />
    </div>
  ),
}

export const SharedFixtureParity: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <ContentEntityCard entity={SILVER_CIRCLE_ENTITY} density="comfortable" />
      <div className="rounded-md border border-border bg-catalog-picker-row-surface">
        <EntityAnatomyHost entity={SILVER_CIRCLE_ENTITY} density="compact" />
      </div>
    </div>
  ),
}
