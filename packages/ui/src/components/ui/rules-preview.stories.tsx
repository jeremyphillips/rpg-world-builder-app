import type { Meta, StoryObj } from '@storybook/react-vite'

import { RulesPreview } from './rules-preview'

const meta = {
  title: 'Primitives/RulesPreview',
  component: RulesPreview,
  args: {
    label: 'Attack preview',
    context: 'Melee',
    content: {
      kind: 'metadata',
      rows: [
        { id: 'attack', label: 'Attack', primary: '+5', secondary: 'STR +3 · PB +2' },
        { id: 'reach', label: 'Reach', primary: '5 ft' },
      ],
    },
  },
} satisfies Meta<typeof RulesPreview>

export default meta

type Story = StoryObj<typeof meta>

export const Metadata: Story = {}

export const Prose: Story = {
  args: {
    label: 'Trait preview',
    context: undefined,
    content: {
      kind: 'prose',
      text: 'The hell hound can burrow through solid rock at half its Burrow Speed and leaves a 10-foot-diameter tunnel in its wake.',
    },
  },
}
