import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Button } from '../button.client'
import { Text } from '../text'
import { CollapsibleListItem, type CollapsibleListItemProps } from './collapsible-list-item.client'

const defaultArgs = {
  itemId: 'demo-item',
  titleId: 'demo-item-title',
  toolbarAriaLabel: 'Battle Axe',
  collapsible: true,
  collapsed: true,
  onToggleCollapse: () => undefined,
  header: (
    <Text as="span" className="truncate text-sm font-medium">
      Battle Axe · Weapon
    </Text>
  ),
} satisfies Partial<CollapsibleListItemProps>

const meta = {
  title: 'Primitives/CollapsibleListItem',
  component: CollapsibleListItem,
  parameters: { layout: 'padded' },
  args: defaultArgs,
} satisfies Meta<typeof CollapsibleListItem>

export default meta
type Story = StoryObj<typeof meta>

function CollapsibleListItemDemo({
  collapsible = true,
  initialCollapsed = true,
}: {
  collapsible?: boolean
  initialCollapsed?: boolean
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed)

  return (
    <CollapsibleListItem
      itemId="demo-item"
      titleId="demo-item-title"
      toolbarAriaLabel="Battle Axe"
      collapsible={collapsible}
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed((current) => !current)}
      header={
        <Text as="span" className="truncate text-sm font-medium">
          Battle Axe · Weapon
        </Text>
      }
      actions={
        <div className="flex items-center gap-2">
          <Text as="span" variant="muted" className="tabular-nums">
            10 GP
          </Text>
          <Button type="button" size="sm" variant="outline">
            Add
          </Button>
        </div>
      }
      body={
        <div className="space-y-3 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">Weapon details</p>
            <p>Category: Martial weapon</p>
            <p>Damage: 1d8 slashing</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Character preview</p>
            <p>Attack: +4</p>
            <p>Damage: 1d8 +2</p>
          </div>
        </div>
      }
    />
  )
}

export const Default: Story = {
  render: () => <CollapsibleListItemDemo />,
}

export const Expanded: Story = {
  render: () => <CollapsibleListItemDemo initialCollapsed={false} />,
}

export const NotCollapsible: Story = {
  render: () => <CollapsibleListItemDemo collapsible={false} initialCollapsed={false} />,
}

export const CompoundApi: Story = {
  render: () => (
    <CollapsibleListItem.Root
      itemId="compound"
      titleId="compound-title"
      toolbarAriaLabel="Compound row"
      collapsible
      collapsed={false}
      onToggleCollapse={() => undefined}
      actions={
        <CollapsibleListItem.Actions>
          <Button type="button" size="sm">
            Add
          </Button>
        </CollapsibleListItem.Actions>
      }
    >
      <CollapsibleListItem.Toolbar
        header={<span className="text-sm font-medium">Compound header</span>}
        summary={<span className="text-xs text-muted-foreground">Optional summary</span>}
      />
      <CollapsibleListItem.Body>
        <p className="text-sm text-muted-foreground">Compound body slot</p>
      </CollapsibleListItem.Body>
    </CollapsibleListItem.Root>
  ),
}
