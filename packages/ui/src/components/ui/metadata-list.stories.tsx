import type { Meta, StoryObj } from '@storybook/react-vite'

import { MetadataList } from './metadata-list'

const meta = {
  title: 'Primitives/MetadataList',
  component: MetadataList,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MetadataList>

export default meta
type Story = StoryObj<typeof meta>

export const SpellDetails: Story = {
  args: {
    size: 'sm',
    items: [
      { label: 'Level', value: '1st' },
      { label: 'School', value: 'Enchantment' },
      { label: 'Casting Time', value: '1 Action' },
      { label: 'Range', value: '30 ft.' },
      { label: 'Duration', value: '1 hour' },
      { label: 'Components', value: 'V, S' },
      { label: 'Ritual', value: 'No' },
      { label: 'Concentration', value: 'No' },
    ],
  },
}
