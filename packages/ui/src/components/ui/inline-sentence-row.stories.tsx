import type { Meta, StoryObj } from '@storybook/react-vite'

import { InlineSentenceConnector, InlineSentenceRow } from './inline-sentence-row'
import { Text } from './text'

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
      <Text variant="body">1</Text>
      <InlineSentenceConnector>through</InlineSentenceConnector>
      <Text variant="body">4</Text>
    </InlineSentenceRow>
  ),
}

export const DiceSentence: Story = {
  render: () => (
    <InlineSentenceRow>
      <Text variant="body">2</Text>
      <InlineSentenceConnector>d</InlineSentenceConnector>
      <Text variant="body">6</Text>
    </InlineSentenceRow>
  ),
}
