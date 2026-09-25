import type { Meta, StoryObj } from '@storybook/react-vite'
import { Ellipsis } from 'lucide-react'

import { Badge } from './badge'
import { Button } from './button.client'
import { Heading } from './heading'
import { Hero, heroMarkFrameClasses, heroMarkImageClasses, heroMediaImageClasses } from './hero'
import { StatusDot } from './status-dot'
import { Text } from './text'

const meta = {
  title: 'Layout/Hero',
  component: Hero,
  args: {
    title: 'Campaign',
  },
} satisfies Meta<typeof Hero>

export default meta
type Story = StoryObj<typeof meta>

const banner = (
  <img
    alt=""
    className={heroMediaImageClasses}
    src="https://picsum.photos/seed/campaign-banner/1200/400"
  />
)

const emblem = (
  <div className={heroMarkFrameClasses}>
    <img
      alt=""
      className={heroMarkImageClasses}
      src="https://picsum.photos/seed/campaign-emblem/240/240"
    />
  </div>
)

export const WithMediaAndOverlapMark: Story = {
  render: () => (
    <Hero
      media={banner}
      mark={emblem}
      markPlacement="overlap"
      title={
        <Heading variant="page" as="h1" className="truncate">
          Ruins of the Shattered Crown
        </Heading>
      }
      actions={
        <Button type="button" variant="outline" size="icon" aria-label="Open actions">
          <Ellipsis aria-hidden />
        </Button>
      }
      meta={
        <Text variant="muted" className="inline-flex items-center gap-1.5 text-sm">
          <StatusDot tone="success" />
          Active · 4 players · 6 characters
        </Text>
      }
      secondary={
        <div className="flex flex-wrap gap-1.5">
          <Badge appearance="soft" tone="neutral" size="sm">
            Heroic
          </Badge>
          <Badge appearance="soft" tone="neutral" size="sm">
            Standard Fantasy
          </Badge>
        </div>
      }
    />
  ),
}

export const WithoutMedia: Story = {
  render: () => (
    <Hero
      title={
        <Heading variant="page" as="h1" className="truncate">
          New Campaign
        </Heading>
      }
      meta={
        <Text variant="muted" className="inline-flex items-center gap-1.5 text-sm">
          <StatusDot tone="sunken" className="ring-1 ring-border" />
          Draft
        </Text>
      }
    />
  ),
}

export const InlineMark: Story = {
  render: () => (
    <Hero
      mark={emblem}
      markPlacement="inline"
      title={
        <Heading variant="page" as="h1" className="truncate">
          Inline Mark
        </Heading>
      }
    />
  ),
}
