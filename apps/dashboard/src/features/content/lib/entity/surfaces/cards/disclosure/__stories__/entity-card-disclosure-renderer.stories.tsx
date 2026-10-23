import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ActionIcon, iconGhostControlVariants, Text } from '@rpg/ui'

import type { EntityAnatomyTrailing } from '../../../../anatomy/entity-anatomy-trailing.types'
import { EntityCardDisclosureRenderer } from '../entity-card-disclosure-renderer'
import { HARBOR_DISTRICT_ENTITY } from '../../../../__tests__/entity.fixture'

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
  title: 'Content/Entity/EntityCardDisclosureRenderer',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function GhostRemoveUtility({ label }: { label: string }) {
  return (
    <button
      type="button"
      className={iconGhostControlVariants({ hover: 'accent', layout: 'flex' })}
      aria-label={`Remove ${label}`}
    >
      <ActionIcon action="remove" size="md" />
    </button>
  )
}

function EntityCardDisclosureDemo({
  density = 'comfortable',
  dragHandleProps,
  trailing,
  initialCollapsed = true,
}: {
  density?: 'compact' | 'comfortable'
  dragHandleProps?: typeof mockDragHandleProps
  trailing?: EntityAnatomyTrailing
  initialCollapsed?: boolean
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed)

  return (
    <div className="max-w-md">
      <EntityCardDisclosureRenderer
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
        <div className="space-y-2 text-style-supporting">
          <p>Population overview and district notes belong in the disclosed body.</p>
          <p>Inner content aligns to the entity content column without consumer inset props.</p>
        </div>
      </EntityCardDisclosureRenderer>
    </div>
  )
}

export const CaretOnlyComfortable: Story = {
  render: () => <EntityCardDisclosureDemo initialCollapsed={false} />,
}

export const CaretOnlyCompact: Story = {
  render: () => <EntityCardDisclosureDemo density="compact" initialCollapsed={false} />,
}

export const GripAndCaretExpanded: Story = {
  render: () => (
    <EntityCardDisclosureDemo dragHandleProps={mockDragHandleProps} initialCollapsed={false} />
  ),
}

export const Collapsed: Story = {
  render: () => <EntityCardDisclosureDemo />,
}

export const BodyEndInsetInvariant: Story = {
  name: 'Body end inset invariant (trailing actions)',
  render: () => (
    <div className="flex max-w-lg flex-col gap-4">
      {(
        [
          { id: 'none', trailing: undefined, label: 'No trailing action' },
          {
            id: 'utility-remove',
            trailing: {
              kind: 'utility' as const,
              content: <GhostRemoveUtility label="Compact" />,
            },
            label: 'Ghost remove utility',
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
        <EntityCardDisclosureRenderer
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
          <Text variant="supporting" className="bg-surface-subtle">
            Domain content — right edge uses density inset only.
          </Text>
        </EntityCardDisclosureRenderer>
      ))}
    </div>
  ),
}

export const PilotInventoryRow: Story = {
  render: () => (
    <div className="max-w-md">
      <EntityCardDisclosureRenderer
        itemId="longsword"
        toolbarAriaLabel="Longsword"
        entity={{
          heading: 'Longsword',
          classification: 'Weapon',
          description: 'Martial melee',
          status: [{ kind: 'badge', label: 'Equipped', tone: 'success' }],
        }}
        density="compact"
        defaultCollapsed={false}
        trailing={{ kind: 'utility', content: <GhostRemoveUtility label="Longsword" /> }}
      >
        <dl className="grid grid-cols-2 gap-2 text-style-supporting">
          <div>
            <dt className="font-medium text-foreground">Damage</dt>
            <dd>1d8 slashing</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Properties</dt>
            <dd>Versatile</dd>
          </div>
        </dl>
      </EntityCardDisclosureRenderer>
    </div>
  ),
}
