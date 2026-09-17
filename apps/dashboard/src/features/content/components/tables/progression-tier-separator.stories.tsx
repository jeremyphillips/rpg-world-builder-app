import type { Meta, StoryObj } from '@storybook/react-vite'
import { Table, TableBody } from '@rpg/ui'

import {
  ProgressionTierSeparatorGridBand,
  ProgressionTierSeparatorTableRow,
} from './progression-tier-separator'

const meta = {
  title: 'Content/Tables/ProgressionTierSeparator',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const PreviewTableRow: Story = {
  render: () => (
    <Table>
      <TableBody>
        <ProgressionTierSeparatorTableRow colSpan={3} label="Epic Destiny Tier" variant="preview" />
      </TableBody>
    </Table>
  ),
}

export const ValuesGridBand: Story = {
  render: () => (
    <div className="grid grid-cols-[5.5rem_1fr]">
      <ProgressionTierSeparatorGridBand tierName="Epic Destiny" />
    </div>
  ),
}
