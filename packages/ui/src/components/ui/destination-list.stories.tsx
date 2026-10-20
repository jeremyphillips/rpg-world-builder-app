import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'

import { InlineMetadata } from './inline-metadata'
import { Card } from './card'
import { DestinationList, DestinationItem } from './destination-list'
import { UI_DESTINATION_ITEM_LINK_CLASS } from './destination-list.variants'
import { IdentityRow } from './identity-row.client'

const meta = {
  title: 'Components/DestinationList',
  component: DestinationList,
  parameters: { layout: 'padded', semanticClasses: true },
} satisfies Meta<typeof DestinationList>

export default meta
type Story = StoryObj<typeof meta>

export const CompactGrouped: Story = {
  render: () => (
    <DestinationList density="compact">
      <DestinationItem
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
      <DestinationItem
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
      <DestinationItem
        link={<a href="#skills">nav</a>}
        title="Skills"
        description="Ability-linked proficiencies used in play."
        metadata={
          <InlineMetadata role="supporting" density="compact">
            <InlineMetadata.Item>18 terms</InlineMetadata.Item>
          </InlineMetadata>
        }
      />
      <DestinationItem
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
      <DestinationItem
        link={<a href="#fireball">nav</a>}
        startSlot={
          <span className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
            ✦
          </span>
        }
        content={
          <IdentityRow heading="Fireball" classification="Spell" supporting="3rd-level evocation" />
        }
      />
      <DestinationItem
        link={<a href="#champion">nav</a>}
        content={
          <IdentityRow
            heading="Champion"
            classification="Subclass"
            supporting="Fighter subclass with a longer supporting line that wraps across multiple rows in narrow layouts."
          />
        }
      />
    </DestinationList>
  ),
}

export const FilledStrongGrouped: Story = {
  name: 'Filled strong grouped',
  render: () => (
    <DestinationList appearance="filled" tone="strong" elevation="subtle" density="comfortable">
      <DestinationItem
        link={<a href="#shattered-vale">nav</a>}
        title="The Shattered Vale"
        description="Active · 3 players · Last opened yesterday"
      />
      <DestinationItem
        link={<a href="#review-invite">nav</a>}
        title="Review invitation"
        description="Avery invited you to join a campaign."
        metadata="Expires in 6 days"
      />
    </DestinationList>
  ),
}

export const CopyScale: Story = {
  name: 'Copy scale',
  render: () => (
    <div className="grid max-w-xl gap-8">
      <DestinationList density="comfortable">
        <DestinationItem
          link={<a href="#simple">nav</a>}
          title="Simple row"
          description="Comfortable supporting copy"
        />
        <DestinationItem
          link={<a href="#rich">nav</a>}
          content={
            <IdentityRow
              heading="Rich row"
              classification="Campaign"
              supporting="Same comfortable title size as the simple row"
            />
          }
        />
      </DestinationList>
      <DestinationList density="compact">
        <DestinationItem
          link={<a href="#compact">nav</a>}
          content={
            <IdentityRow heading="Inherited compact" supporting="14px title, 12px supporting" />
          }
        />
      </DestinationList>
      <Card
        density="spacious"
        header={{ title: 'Spacious card', description: '19px title, 14px supporting' }}
      >
        <IdentityRow heading="Inherited spacious" supporting="Title follows the card" />
      </Card>
      <IdentityRow
        heading="Standalone"
        supporting="Comfortable fallback when no surface sets density"
      />
    </div>
  ),
}

function shellBackgroundColor(element: HTMLElement): string {
  return getComputedStyle(element).backgroundColor
}

function SurfaceInteractionParityBlock({ testIdPrefix }: { testIdPrefix: string }) {
  return (
    <div className="grid max-w-md gap-6">
      <Card
        interactive
        tone="strong"
        data-testid={`${testIdPrefix}-interactive-strong-card`}
        header={{ title: 'Equipment', description: 'Open a catalog family.' }}
      />
      <DestinationList
        appearance="filled"
        density="comfortable"
        data-testid={`${testIdPrefix}-filled-strong-list`}
      >
        <DestinationItem
          link={<a href="#continue">nav</a>}
          title="Continue campaign"
          description="The Shattered Vale"
        />
      </DestinationList>
    </div>
  )
}

async function assertSurfaceInteractionParity(canvasElement: ParentNode, testIdPrefix: string) {
  const card = canvasElement.querySelector<HTMLElement>(
    `[data-testid="${testIdPrefix}-interactive-strong-card"]`,
  )!
  const list = canvasElement.querySelector<HTMLElement>(
    `[data-testid="${testIdPrefix}-filled-strong-list"]`,
  )!
  const link = canvasElement.querySelector<HTMLElement>(`.${UI_DESTINATION_ITEM_LINK_CLASS}`)!

  expect(shellBackgroundColor(card)).toBe(shellBackgroundColor(list))

  await userEvent.hover(card)
  const cardHover = shellBackgroundColor(card)
  await userEvent.hover(link)
  const linkHover = shellBackgroundColor(link)
  expect(linkHover).toBe(cardHover)

  await userEvent.unhover(card)
  await userEvent.unhover(link)

  await userEvent.pointer({ keys: '[MouseLeft>]', target: card })
  const cardPressed = shellBackgroundColor(card)
  await userEvent.pointer({ keys: '[/MouseLeft]', target: card })

  await userEvent.pointer({ keys: '[MouseLeft>]', target: link })
  const linkPressed = shellBackgroundColor(link)
  await userEvent.pointer({ keys: '[/MouseLeft]', target: link })
  expect(linkPressed).toBe(cardPressed)

  link.focus()
  const linkFocusBg = shellBackgroundColor(link)
  expect(linkFocusBg).not.toBe(cardHover)
  expect(linkFocusBg).not.toBe(linkHover)
}

export const SurfaceInteractionParity: Story = {
  name: 'Surface interaction parity',
  tags: ['card-surface-colors'],
  parameters: {
    docs: {
      description: {
        story:
          'Filled strong destination row hover/pressed backgrounds match interactive strong Card using `surface-interaction.css` (real pointer, not preview classes).',
      },
    },
  },
  render: () => (
    <div className="grid gap-10">
      <section className="space-y-2" data-testid="parity-light">
        <p className="text-style-label">Light</p>
        <SurfaceInteractionParityBlock testIdPrefix="parity-light" />
      </section>
      <section className="dark space-y-2 rounded-lg bg-background p-4" data-testid="parity-dark">
        <p className="text-style-label">Dark</p>
        <SurfaceInteractionParityBlock testIdPrefix="parity-dark" />
      </section>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const light = canvasElement.querySelector('[data-testid="parity-light"]')!
    const dark = canvasElement.querySelector('[data-testid="parity-dark"]')!
    await assertSurfaceInteractionParity(light, 'parity-light')
    await assertSurfaceInteractionParity(dark, 'parity-dark')
  },
}

export const ComparedToNavigableCard: Story = {
  name: 'Compared to navigable Card',
  render: () => (
    <div className="grid max-w-md gap-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Grouped destination rows</p>
        <DestinationList density="compact">
          <DestinationItem
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
