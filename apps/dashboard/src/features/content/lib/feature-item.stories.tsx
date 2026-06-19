import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'

import { FeatureItem } from './feature-item'

const meta = {
  title: 'Content/FeatureItem',
  component: FeatureItem,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <ul>
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof FeatureItem>

export default meta
type Story = StoryObj<typeof meta>

export const SingleParagraph: Story = {
  args: {
    feature: {
      level: 3,
      name: 'Bonus Proficiencies',
      description: '<p>You gain proficiency with three skills of your choice.</p>',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/Level 3: Bonus Proficiencies/)).toBeInTheDocument()
    await expect(canvas.getByText(/three skills of your choice/)).toBeInTheDocument()
  },
}

export const MultiParagraph: Story = {
  args: {
    feature: {
      level: 1,
      name: 'Spellcasting',
      description:
        '<p>You have learned to cast spells through your bardic arts.</p><p><strong>Cantrips.</strong> You know two cantrips.</p>',
    },
  },
}
