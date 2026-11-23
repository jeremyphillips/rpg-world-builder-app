import type { Meta, StoryObj } from '@storybook/react'

import { FacingHostPanel } from './facing-host-panel'

const meta = {
  title: 'Primitives/FacingHostPanel',
  component: FacingHostPanel,
} satisfies Meta<typeof FacingHostPanel>

export default meta

type Story = StoryObj<typeof meta>

export const SpellcastingReady: Story = {
  args: {
    resolution: {
      status: 'ready',
      document: {
        title: 'Spellcasting',
        blocks: [
          { kind: 'richText', html: '<p>You have learned to cast spells.</p>' },
          {
            kind: 'rules',
            document: [
              [
                { kind: 'lead', treatment: 'inline', label: 'Cantrips' },
                { kind: 'text', value: '2' },
              ],
            ],
          },
        ],
      },
    },
  },
}

export const InvalidKind: Story = {
  args: {
    resolution: { status: 'invalid', code: 'missing-kind' },
  },
}
