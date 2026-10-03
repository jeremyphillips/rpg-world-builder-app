import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge } from './badge'
import { Link } from './link'
import { InlineMetadata } from './inline-metadata'

const meta = {
  title: 'Primitives/InlineMetadata',
  component: InlineMetadata,
  parameters: { layout: 'padded' },
  args: {
    role: 'heading' as const,
    density: 'compact' as const,
    children: null,
  },
} satisfies Meta<typeof InlineMetadata>

export default meta
type Story = StoryObj<typeof meta>

export const HeadingCompact: Story = {
  render: () => (
    <p className="text-base font-semibold">
      <InlineMetadata role="heading" density="compact" wrap={false}>
        <InlineMetadata.Item truncate>Very Long Location Name</InlineMetadata.Item>
        <InlineMetadata.Item>District</InlineMetadata.Item>
      </InlineMetadata>
    </p>
  ),
}

export const HeadingComfortable: Story = {
  render: () => (
    <h2 className="text-lg font-semibold">
      <InlineMetadata role="heading" density="comfortable" wrap={false}>
        <InlineMetadata.Item>Harborford</InlineMetadata.Item>
        <InlineMetadata.Item>City</InlineMetadata.Item>
      </InlineMetadata>
    </h2>
  ),
}

export const SupportingCompact: Story = {
  render: () => (
    <p className="text-sm">
      <InlineMetadata role="supporting" density="compact">
        <InlineMetadata.Item>Weapon</InlineMetadata.Item>
        <InlineMetadata.Item>1d8 slashing</InlineMetadata.Item>
      </InlineMetadata>
    </p>
  ),
}

export const SupportingComfortable: Story = {
  render: () => (
    <p className="text-sm">
      <InlineMetadata role="supporting" density="comfortable">
        <InlineMetadata.Item>Level 3</InlineMetadata.Item>
        <InlineMetadata.Item>Enchantment</InlineMetadata.Item>
        <InlineMetadata.Item>Concentration</InlineMetadata.Item>
      </InlineMetadata>
    </p>
  ),
}

export const LongWrappingMetadata: Story = {
  render: () => (
    <div className="w-40 border border-border p-2 text-sm">
      <InlineMetadata role="supporting" density="comfortable" wrap>
        <InlineMetadata.Item>Building</InlineMetadata.Item>
        <InlineMetadata.Item>Tavern</InlineMetadata.Item>
        <InlineMetadata.Item>Harbor District</InlineMetadata.Item>
        <InlineMetadata.Item>Active</InlineMetadata.Item>
      </InlineMetadata>
    </div>
  ),
}

export const MixedInteractiveItems: Story = {
  render: () => (
    <p className="text-sm">
      <InlineMetadata role="supporting" density="compact" wrap={false}>
        <InlineMetadata.Item>
          <Link href="#">Fireball</Link>
        </InlineMetadata.Item>
        <InlineMetadata.Item>
          <Badge appearance="outline" tone="info" size="sm">
            3rd
          </Badge>
        </InlineMetadata.Item>
        <InlineMetadata.Item>Evocation</InlineMetadata.Item>
      </InlineMetadata>
    </p>
  ),
}

export const ConditionalItems: Story = {
  render: () => {
    const damage = '1d6 fire'
    const range: string | null = null

    return (
      <p className="text-sm">
        <InlineMetadata role="supporting" density="compact">
          <InlineMetadata.Item>Weapon</InlineMetadata.Item>
          {damage ? <InlineMetadata.Item>{damage}</InlineMetadata.Item> : null}
          {range ? <InlineMetadata.Item>{range}</InlineMetadata.Item> : null}
          <InlineMetadata.Item>Martial</InlineMetadata.Item>
        </InlineMetadata>
      </p>
    )
  },
}
