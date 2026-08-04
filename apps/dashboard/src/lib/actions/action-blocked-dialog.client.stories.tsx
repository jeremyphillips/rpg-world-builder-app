import type { Meta, StoryObj } from '@storybook/react-vite'

import { ActionBlockedDialog } from './action-blocked-dialog.client'

const meta = {
  title: 'Actions/ActionBlockedDialog',
  component: ActionBlockedDialog,
  args: {
    open: true,
    campaignId: 'camp_1',
    targetName: 'Fighter',
    title: 'Cannot turn off availability',
    description:
      'This item is blocked by active characters. Remove the references before continuing.',
    blockers: [
      {
        kind: 'usage',
        usage: {
          kind: 'character',
          id: 'pc_1',
          label: 'Morgran Stonebreaker',
          characterType: 'pc',
          campaignId: 'camp_1',
        },
      },
      {
        kind: 'usage',
        usage: {
          kind: 'character',
          id: 'pc_2',
          label: 'Thorin Strakeln',
          characterType: 'pc',
          campaignId: 'camp_1',
        },
      },
    ],
  },
} satisfies Meta<typeof ActionBlockedDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onOpenChange: () => undefined,
  },
}
