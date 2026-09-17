import type { Meta, StoryObj } from '@storybook/react-vite'

import { TableGrid } from './table-grid'
import { ProgressionTableView } from './progression-table-view'
import {
  martialArtsProgressionTableFixture,
  mixedProgressionTableFixture,
  rageProgressionTableFixture,
} from './progression-table-fixtures'

const meta = {
  title: 'Content/Tables/ProgressionTableView',
  component: ProgressionTableView,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProgressionTableView>

export default meta
type Story = StoryObj<typeof meta>

export const RageProgression: Story = {
  args: {
    table: rageProgressionTableFixture,
  },
}

export const MartialArtsDice: Story = {
  args: {
    table: martialArtsProgressionTableFixture,
  },
}

export const MixedColumns: Story = {
  args: {
    table: mixedProgressionTableFixture,
  },
}

export const IncompletePresentation: Story = {
  args: {
    table: rageProgressionTableFixture,
  },
  render: () => (
    <TableGrid
      rowHeaderLabel="Level"
      presentation={{
        name: 'Draft preview',
        columns: [
          { key: 'uses', label: 'Uses' },
          { key: 'damage-bonus', label: 'Rage Damage' },
        ],
        rows: [
          { rowHeader: 1, cells: { uses: '2', 'damage-bonus': '+2' } },
          { rowHeader: 6, cells: { uses: '4' } },
        ],
      }}
    />
  ),
}
