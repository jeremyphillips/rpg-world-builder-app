import type { Meta, StoryObj } from '@storybook/react-vite'

import { InlineMetadata } from './inline-metadata'
import { Card } from './card'
import { DestinationList, DestinationRow } from './destination-list'
import { IdentityRow } from './identity-row.client'

const meta = {
  title: 'Components/DestinationList',
  component: DestinationList,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DestinationList>

export default meta
type Story = StoryObj<typeof meta>

export const CompactGrouped: Story = {
  render: () => (
    <DestinationList density="compact">
      <DestinationRow
        link={<a href="#creature-types">nav</a>}
        title="Creature types"
        description="Taxonomic classification shared by species and monsters."
        metadata={
          <InlineMetadata role="supporting" density="compact">
            <InlineMetadata.Item>9 terms</InlineMetadata.Item>
            <InlineMetadata.Item>1 unavailable</InlineMetadata.Item>
          </InlineMetadata>
        }
      />
      <DestinationRow
        link={<a href="#damage-types">nav</a>}
        title="Damage types"
        description="Energy, physical, and other harm categories."
        metadata={
          <InlineMetadata role="supporting" density="compact">
            <InlineMetadata.Item>13 terms</InlineMetadata.Item>
          </InlineMetadata>
        }
      />
    </DestinationList>
  ),
}

export const ComfortableGrouped: Story = {
  render: () => (
    <DestinationList density="comfortable">
      <DestinationRow
        link={<a href="#skills">nav</a>}
        title="Skills"
        description="Ability-linked proficiencies used in play."
        metadata={
          <InlineMetadata role="supporting" density="compact">
            <InlineMetadata.Item>18 terms</InlineMetadata.Item>
          </InlineMetadata>
        }
      />
      <DestinationRow
        link={<a href="#conditions">nav</a>}
        title="Conditions"
        description="Temporary states that alter what characters can do."
      />
    </DestinationList>
  ),
}

export const EmbeddedRichSearchRow: Story = {
  name: 'Embedded rich search row',
  render: () => (
    <DestinationList appearance="embedded" density="compact">
      <DestinationRow
        link={<a href="#fireball">nav</a>}
        startSlot={
          <span className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
            ✦
          </span>
        }
        content={
          <IdentityRow
            heading="Fireball"
            classification="Spell"
            supporting="3rd-level evocation"
            size="md"
          />
        }
      />
      <DestinationRow
        link={<a href="#champion">nav</a>}
        content={
          <IdentityRow
            heading="Champion"
            classification="Subclass"
            supporting="Fighter subclass with a longer supporting line that wraps across multiple rows in narrow layouts."
            size="md"
          />
        }
      />
    </DestinationList>
  ),
}

export const FilledStrongGrouped: Story = {
  name: 'Filled strong grouped',
  render: () => (
    <DestinationList appearance="filled" tone="strong" density="comfortable">
      <DestinationRow
        link={<a href="#shattered-vale">nav</a>}
        title="The Shattered Vale"
        description="Active · 3 players · Last opened yesterday"
      />
      <DestinationRow
        link={<a href="#review-invite">nav</a>}
        title="Review invitation"
        description="Avery invited you to join a campaign."
        metadata="Expires in 6 days"
      />
    </DestinationList>
  ),
}

export const ComparedToNavigableCard: Story = {
  name: 'Compared to navigable Card',
  render: () => (
    <div className="grid max-w-md gap-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Grouped destination rows</p>
        <DestinationList density="compact">
          <DestinationRow
            link={<a href="#weapons">nav</a>}
            title="Weapons"
            description="Melee and ranged gear families."
            metadata={
              <InlineMetadata role="supporting" density="compact">
                <InlineMetadata.Item>4 families</InlineMetadata.Item>
              </InlineMetadata>
            }
          />
        </DestinationList>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Standalone navigable Card</p>
        <Card
          link={<a href="#armor">nav</a>}
          density="compact"
          tone="strong"
          stretch
          header={{
            title: 'Armor',
            description: 'Protective gear families for characters.',
          }}
        />
      </div>
    </div>
  ),
}
