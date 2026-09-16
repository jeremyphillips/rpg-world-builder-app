import type { Meta, StoryObj } from '@storybook/react-vite'

import { ProgressionTableGrid } from './progression-table-grid'
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
    <ProgressionTableGrid
      presentation={{
        name: 'Draft preview',
        columns: [
          { key: 'uses', label: 'Uses' },
          { key: 'damage-bonus', label: 'Rage Damage' },
        ],
        rows: [
          { level: 1, values: { uses: '2', 'damage-bonus': '+2' } },
          { level: 6, values: { uses: '4' } },
        ],
      }}
    />
  ),
}
