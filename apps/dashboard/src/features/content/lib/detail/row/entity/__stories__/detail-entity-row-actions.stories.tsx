import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus } from 'lucide-react'

import { Button } from '@rpg/ui'

import { DetailEntityRow } from '../detail-entity-row'
import { DetailEntityRowActions } from '../detail-entity-row-actions'
import { DetailOverflowMenu } from '../../../detail-overflow-menu'

const meta = {
  title: 'Content/Detail/DetailEntityRowActions',
  component: DetailEntityRowActions,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DetailEntityRowActions>

export default meta
type Story = StoryObj<typeof DetailEntityRowActions>

export const UtilityAndOverflow: Story = {
  render: () => (
    <DetailEntityRow
      heading="Dock Ward"
      headingHref="/campaigns/demo/locations/dock-ward"
      headingSuffix=" · District · 1 location"
      trailing={{
        kind: 'action',
        content: (
          <DetailEntityRowActions>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              density="compact"
              aria-label="Add location to Dock Ward"
            >
              <Plus aria-hidden />
            </Button>
            <DetailOverflowMenu
              triggerLabel="Actions for Dock Ward"
              actions={[
                { id: 'view', label: 'View location', onSelect: () => undefined },
                { id: 'move', label: 'Move location', onSelect: () => undefined },
              ]}
            />
          </DetailEntityRowActions>
        ),
      }}
    />
  ),
}
