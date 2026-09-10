import type { Meta, StoryObj } from '@storybook/react-vite'

import { Text } from '@rpg/ui'

import { LandingSection } from './landing-section'

const meta = {
  title: 'Landing/LandingSection',
  component: LandingSection,
} satisfies Meta<typeof LandingSection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    id: 'example',
    eyebrow: 'Section eyebrow',
    heading: 'A landing page section',
    description: 'Optional lead text that sets up the content below.',
    children: (
      <Text variant="muted" as="p" className="text-center">
        Section body content goes here.
      </Text>
    ),
  },
}

export const MutedSurface: Story = {
  args: {
    ...Default.args,
    surface: 'muted',
  },
}
