import type { Meta, StoryObj } from '@storybook/react-vite'

import { InlineSentenceConnector, InlineSentenceRow } from './inline-sentence-row'

const meta = {
  title: 'UI/InlineSentenceRow',
  component: InlineSentenceRow,
  args: {
    children: null,
  },
} satisfies Meta<typeof InlineSentenceRow>

export default meta

type Story = StoryObj<typeof meta>

export const LevelRangeSentence: Story = {
  render: () => (
    <InlineSentenceRow>
      <InlineSentenceConnector size="sm">1</InlineSentenceConnector>
      <InlineSentenceConnector size="sm">through</InlineSentenceConnector>
      <InlineSentenceConnector size="sm">4</InlineSentenceConnector>
    </InlineSentenceRow>
  ),
}

export const DiceSentence: Story = {
  render: () => (
    <InlineSentenceRow>
      <InlineSentenceConnector size="sm" tone="mono" aria-hidden>
        2
      </InlineSentenceConnector>
      <InlineSentenceConnector size="sm" tone="mono" aria-hidden>
        d
      </InlineSentenceConnector>
      <InlineSentenceConnector size="sm" tone="mono" aria-hidden>
        6
      </InlineSentenceConnector>
    </InlineSentenceRow>
  ),
}
