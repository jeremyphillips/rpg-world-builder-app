import type { Meta, StoryObj } from '@storybook/react-vite'

import { ActionTargetResolutionList } from './action-target-resolution-list'

const meta = {
  title: 'Actions/ActionTargetResolutionList',
  component: ActionTargetResolutionList,
  args: {
    legend: 'Apply to',
    campaignId: 'camp_1',
  },
} satisfies Meta<typeof ActionTargetResolutionList>

export default meta
type Story = StoryObj<typeof meta>

export const ResolveRows: Story = {
  args: {
    rows: [
      {
        targetId: 'a',
        targetName: 'Alert',
        state: 'eligible',
        checked: true,
        disabled: false,
      },
      {
        targetId: 'b',
        targetName: 'Sharpshooter',
        state: 'blocked',
        checked: false,
        disabled: true,
        blockers: [
          {
            kind: 'usage',
            usage: {
              kind: 'character',
              id: 'pc_1',
              label: 'Aldric',
              characterType: 'pc',
            },
          },
        ],
      },
    ],
    onCheckedChange: () => undefined,
  },
}

export const ResultRows: Story = {
  args: {
    rows: [
      {
        targetId: 'a',
        targetName: 'Alert',
        state: 'updated',
        checked: false,
        disabled: true,
      },
      {
        targetId: 'b',
        targetName: 'Sharpshooter',
        state: 'failed',
        checked: false,
        disabled: true,
        failure: { code: 'network', message: 'Could not reach the server.' },
      },
    ],
  },
}
