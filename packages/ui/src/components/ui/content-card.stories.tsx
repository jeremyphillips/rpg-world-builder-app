import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge } from './badge'
import { ContentCardHeadingAction } from './content-card-actions.client'
import { ContentCard } from './content-card.client'
import { ContentCardMedia, ContentCardRemoveButton } from './content-card-parts.client'

const meta = {
  title: 'UI/ContentCard',
  component: ContentCard,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ContentCard>

export default meta
type Story = StoryObj<typeof meta>

export const HeadingOnlyComfortable: Story = {
  name: 'Heading only (comfortable)',
  parameters: {
    docs: {
      description: {
        story:
          'Heading-only rows omit artificial heading-row bottom margin. Default density is comfortable.',
      },
    },
  },
  args: {
    heading: 'Harbor District',
  },
}

export const HeadingOnlyCompact: Story = {
  name: 'Heading only (compact)',
  args: {
    density: 'compact',
    heading: 'Harbor District',
  },
}

export const HeadingWithSubheadingComfortable: Story = {
  name: 'Heading + subheading (comfortable)',
  parameters: {
    docs: {
      description: {
        story:
          'Secondary text adds a 4px (mb-1) gap below the heading row when no heading-end slot is present.',
      },
    },
  },
  args: {
    heading: 'Harbor District',
    subheading: 'Settlement overview',
  },
}

export const HeadingWithSubheadingCompact: Story = {
  name: 'Heading + subheading (compact)',
  args: {
    density: 'compact',
    heading: 'Harbor District',
    subheading: 'Settlement overview',
  },
}

export const HeadingSubheadingWithHeadingEndSlotComfortable: Story = {
  name: 'Heading + subheading + headingEndSlot (comfortable)',
  parameters: {
    docs: {
      description: {
        story:
          'When a heading-end slot is present, secondary lines follow the heading row directly (mb-0).',
      },
    },
  },
  render: (args) => (
    <ContentCard
      {...args}
      headingEndSlot={
        <ContentCardHeadingAction asChild>
          <a href="/locations/harbor">View</a>
        </ContentCardHeadingAction>
      }
    />
  ),
  args: {
    heading: 'Harbor District',
    subheading: 'Settlement overview',
  },
}

export const HeadingEndSlotAndEndSlotComfortable: Story = {
  name: 'headingEndSlot + endSlot (comfortable)',
  parameters: {
    docs: {
      description: {
        story:
          'Regression coverage for inline View actions alongside row-level status or remove controls.',
      },
    },
  },
  render: (args) => (
    <ContentCard
      {...args}
      headingEndSlot={
        <ContentCardHeadingAction asChild>
          <a href="/locations/harbor">View</a>
        </ContentCardHeadingAction>
      }
      endSlot={<Badge tone="warning">Unavailable</Badge>}
    />
  ),
  args: {
    heading: 'Harbor District',
    subheading: 'Settlement overview',
  },
}

export const MediaWithEndSlotComfortable: Story = {
  name: 'Media + endSlot (comfortable)',
  args: {
    heading: 'Silver Circle',
    subheading: 'Secret society',
    media: <ContentCardMedia src="/fallback-content.png" alt="Silver Circle" />,
    endSlot: <Badge tone="warning">Unavailable</Badge>,
  },
}

export const LongLinkedHeadingComfortable: Story = {
  name: 'Long linked heading (comfortable)',
  parameters: {
    docs: {
      description: {
        story: 'Heading, subheading, and metadata lines truncate with ellipsis in narrow columns.',
      },
    },
  },
  args: {
    heading: 'Placeholder',
    subheading: 'An extraordinarily long summary line that should ellipsize in narrow layouts',
    metadata: 'An extraordinarily long metadata line that should ellipsize in narrow layouts',
  },
  render: () => (
    <ContentCard
      heading={
        <a href="/locations/harbor" className="text-link">
          An extraordinarily long location name that should ellipsize in narrow layouts
        </a>
      }
      subheading="An extraordinarily long summary line that should ellipsize in narrow layouts"
      metadata="An extraordinarily long metadata line that should ellipsize in narrow layouts"
    />
  ),
}

export const ChromeStandalone: Story = {
  name: 'Chrome standalone',
  args: {
    chrome: 'standalone',
    heading: 'Harbor District',
    subheading: 'Settlement overview',
  },
}

export const ChromeEmbedded: Story = {
  name: 'Chrome embedded',
  args: {
    chrome: 'embedded',
    heading: 'Harbor District',
    subheading: 'Settlement overview',
  },
}

export const ChromeStandaloneFilled: Story = {
  name: 'Chrome standalone (filled)',
  args: {
    chrome: 'standalone',
    className: 'bg-card',
    heading: 'Harbor District',
    subheading: 'Settlement overview',
  },
}

export const HeadingActionAsChildLinkComfortable: Story = {
  name: 'ContentCardHeadingAction asChild + Link',
  render: (args) => (
    <ContentCard
      {...args}
      headingEndSlot={
        <ContentCardHeadingAction asChild>
          <a href="/locations/harbor">View</a>
        </ContentCardHeadingAction>
      }
    />
  ),
  args: {
    heading: 'Harbor District',
    subheading: 'Settlement overview',
  },
}

export const CompactRemoveAction: Story = {
  name: 'Compact remove action',
  args: {
    density: 'compact',
    chrome: 'standalone',
    className: 'bg-card',
    heading: 'Verna',
    subheading: 'Dwarf · Level 1 Fighter',
    endSlot: <ContentCardRemoveButton label="Verna" onRemove={() => undefined} />,
  },
}
