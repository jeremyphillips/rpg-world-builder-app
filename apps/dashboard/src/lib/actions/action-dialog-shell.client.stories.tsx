import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from '@rpg/ui'

import { ActionDialogShell } from './action-dialog-shell.client'

const meta = {
  title: 'Actions/ActionDialogShell',
  component: ActionDialogShell,
  args: {
    open: true,
    onOpenChange: () => undefined,
    headline: 'Edit campaign availability',
    description: 'Apply changes to 3 selected items.',
    configureSlot: <Text variant="small">Configure fields render here.</Text>,
    summarySlot: <Text variant="small">2 items will change. 1 item unchanged.</Text>,
  },
} satisfies Meta<typeof ActionDialogShell>

export default meta
type Story = StoryObj<typeof meta>

export const Configure: Story = {
  args: {
    phase: 'configure',
    onConfigureApply: () => undefined,
  },
}

export const Resolve: Story = {
  args: {
    phase: 'resolve',
    confirmedCount: 2,
    resolveNoun: 'items',
    resolutionLegend: 'Apply to',
    resolutionRows: [
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
    campaignId: 'camp_1',
    onResolveConfirm: () => undefined,
    onResolveBack: () => undefined,
    onCancel: () => undefined,
  },
}

export const Result: Story = {
  args: {
    phase: 'result',
    resolutionRows: [
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
    onRetryFailed: () => undefined,
    onAcceptMixedResult: () => undefined,
    onCancel: () => undefined,
  },
}
