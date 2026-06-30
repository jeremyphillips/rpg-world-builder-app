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
      level: 5,
      name: 'Extra Attack',
      description:
        '<p>You can attack twice instead of once whenever you take the Attack action on your turn.</p>',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { level: 3, name: 'Level 5: Extra Attack' }),
    ).toBeInTheDocument()
    await expect(canvas.getByText(/twice instead of once/)).toBeInTheDocument()
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
