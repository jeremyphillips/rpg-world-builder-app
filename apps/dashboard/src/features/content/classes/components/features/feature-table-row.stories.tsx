import type { Meta, StoryObj } from '@storybook/react-vite'

import { DetailOverflowMenu } from '../../../lib/detail/detail-overflow-menu'
import { FeatureTableRow } from './feature-table-row'

const meta = {
  title: 'Content/Classes/FeatureTableRow',
  component: FeatureTableRow,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FeatureTableRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Rage',
    metadata: '2 columns · 5 level breakpoints',
    typeLabel: 'Level progression',
    onEdit: () => undefined,
    overflowActions: (
      <DetailOverflowMenu
        triggerLabel="Actions for Rage"
        actions={[
          {
            id: 'delete',
            label: 'Delete table',
            destructive: true,
            onSelect: () => undefined,
          },
        ]}
      />
    ),
  },
}
