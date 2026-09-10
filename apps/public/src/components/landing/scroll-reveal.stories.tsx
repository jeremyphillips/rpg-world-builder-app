import type { Meta, StoryObj } from '@storybook/react-vite'

import { Card, CardContent, CardHeader, CardTitle, Text } from '@rpg/ui'

import { ScrollReveal } from './scroll-reveal.client'

const meta = {
  title: 'Landing/ScrollReveal',
  component: ScrollReveal,
} satisfies Meta<typeof ScrollReveal>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <Card>
        <CardHeader>
          <CardTitle>Revealed content</CardTitle>
        </CardHeader>
        <CardContent>
          <Text variant="muted" as="p">
            Fades and rises into view when scrolled into the viewport.
          </Text>
        </CardContent>
      </Card>
    ),
  },
}

export const BelowTheFold: Story = {
  args: {
    children: (
      <Card>
        <CardHeader>
          <CardTitle>Scroll down to reveal</CardTitle>
        </CardHeader>
      </Card>
    ),
  },
  decorators: [
    (Story) => (
      <div>
        <div className="flex h-[150vh] items-center justify-center">
          <Text variant="muted" as="p">
            Scroll down…
          </Text>
        </div>
        <Story />
        <div className="h-96" />
      </div>
    ),
  ],
}
