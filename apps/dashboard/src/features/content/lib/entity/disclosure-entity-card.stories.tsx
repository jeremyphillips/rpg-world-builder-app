import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import type { EntityItemTrailing } from './entity-item-trailing.types'
import { DisclosureEntityCard } from './disclosure-entity-card.client'
import { HARBOR_DISTRICT_ENTITY } from './entity.fixture'

const mockDragHandleProps = {
  attributes: {
    role: 'button',
    tabIndex: 0,
    'aria-disabled': false,
    'aria-pressed': false,
    'aria-roledescription': 'draggable',
    'aria-describedby': 'dnd-kit-description',
  },
  listeners: {},
} as const

const meta = {
  title: 'Content/Entity/DisclosureEntityCard',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function DisclosureEntityCardDemo({
  density = 'comfortable',
  dragHandleProps,
  trailing,
  initialCollapsed = true,
}: {
  density?: 'compact' | 'comfortable'
  dragHandleProps?: typeof mockDragHandleProps
  trailing?: EntityItemTrailing
  initialCollapsed?: boolean
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed)

  return (
    <div className="max-w-md">
      <DisclosureEntityCard
        itemId="harbor-district"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        headingHref="/campaigns/demo/locations/harbor"
        density={density}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((current) => !current)}
        dragHandleProps={dragHandleProps}
        trailing={
          trailing ?? {
            kind: 'action',
            content: (
              <button type="button" className="text-sm text-link">
                Manage
              </button>
            ),
          }
        }
      >
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Population overview and district notes belong in the disclosed body.</p>
          <p>Inner content aligns to the entity content column without consumer inset props.</p>
        </div>
      </DisclosureEntityCard>
    </div>
  )
}

export const CaretOnlyComfortable: Story = {
  render: () => <DisclosureEntityCardDemo initialCollapsed={false} />,
}

export const CaretOnlyCompact: Story = {
  render: () => <DisclosureEntityCardDemo density="compact" initialCollapsed={false} />,
}

export const GripAndCaretExpanded: Story = {
  render: () => (
    <DisclosureEntityCardDemo dragHandleProps={mockDragHandleProps} initialCollapsed={false} />
  ),
}

export const Collapsed: Story = {
  render: () => <DisclosureEntityCardDemo />,
}

export const BodyEndInsetInvariant: Story = {
  name: 'Body end inset invariant (trailing actions)',
  render: () => (
    <div className="flex max-w-lg flex-col gap-4">
      {(
        [
          { id: 'none', trailing: undefined, label: 'No trailing action' },
          {
            id: 'delete',
            trailing: { kind: 'action' as const, content: <button type="button">Remove</button> },
            label: 'Delete action',
          },
          {
            id: 'add',
            trailing: { kind: 'action' as const, content: <button type="button">Add</button> },
            label: 'Add action',
          },
          {
            id: 'wide',
            trailing: {
              kind: 'action' as const,
              content: <button type="button">Add to inventory · 105 GP</button>,
            },
            label: 'Wider trailing action',
          },
        ] as const
      ).map((entry) => (
        <DisclosureEntityCard
          key={entry.id}
          itemId={entry.id}
          toolbarAriaLabel={entry.label}
          entity={{
            heading: entry.label,
            classification: 'Compact',
            description: 'Body inline-end inset must match across these rows.',
          }}
          density="compact"
          defaultCollapsed={false}
          trailing={entry.trailing}
        >
          <p className="bg-surface-subtle text-sm text-muted-foreground">
            Domain content — right edge uses density inset only.
          </p>
        </DisclosureEntityCard>
      ))}
    </div>
  ),
}

export const PilotInventoryRow: Story = {
  render: () => (
    <div className="max-w-md">
      <DisclosureEntityCard
        itemId="longsword"
        toolbarAriaLabel="Longsword"
        entity={{
          heading: 'Longsword',
          classification: 'Weapon',
          description: 'Martial melee',
          status: ['Equipped'],
        }}
        density="compact"
        defaultCollapsed={false}
        trailing={{ kind: 'action', content: <button type="button">Remove</button> }}
      >
        <dl className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div>
            <dt className="font-medium text-foreground">Damage</dt>
            <dd>1d8 slashing</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Properties</dt>
            <dd>Versatile</dd>
          </div>
        </dl>
      </DisclosureEntityCard>
    </div>
  ),
}
