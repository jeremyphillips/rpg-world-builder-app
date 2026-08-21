import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { RelationshipList } from './relationship-list'
import {
  relationshipListFooterVariants,
  relationshipListRootVariants,
} from './relationship-list.variants'

describe('RelationshipList layout mechanics', () => {
  it('renders section Empty without Footer when itemCount is 0', () => {
    const { container } = render(
      <RelationshipList.Root itemCount={0} emptyLabel="No members linked." />,
    )

    expect(screen.getByText('No members linked.')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="relationship-list-footer"]')).toBeNull()
    expect(container.querySelector('[data-slot="relationship-list-group"]')).toBeNull()
  })

  it('renders Footer without Empty when itemCount is greater than 0', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()

    const { container } = render(
      <MemoryRouter>
        <RelationshipList.Root itemCount={1} action={{ label: 'Add member', onSelect: onAdd }}>
          <RelationshipList.Group itemCount={1}>
            <RelationshipList.Row title="Circle Envoy" href="/npc/1" />
          </RelationshipList.Group>
        </RelationshipList.Root>
      </MemoryRouter>,
    )

    expect(container.querySelector('[data-slot="relationship-list-empty"]')).toBeNull()
    expect(container.querySelector('[data-slot="relationship-list-footer"]')).toBeInTheDocument()
    expect(screen.queryByText('No members linked.')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add member' }))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('renders inline slot empty without a ul when group itemCount is 0', () => {
    const { container } = render(
      <RelationshipList.Root itemCount={1}>
        <RelationshipList.Group itemCount={0} emptyLabel="No governing organization." />
      </RelationshipList.Root>,
    )

    const group = container.querySelector('[data-slot="relationship-list-group"]')
    expect(group).toBeInTheDocument()
    expect(group?.querySelector('ul')).toBeNull()
    expect(screen.getByText('No governing organization.')).toBeInTheDocument()
  })

  it('renders record-separated rows when group itemCount is greater than 0', () => {
    const { container } = render(
      <RelationshipList.Root itemCount={2}>
        <RelationshipList.Group itemCount={2}>
          <RelationshipList.Row title="First" />
          <RelationshipList.Row title="Second" />
        </RelationshipList.Group>
      </RelationshipList.Root>,
    )

    const list = container.querySelector('ul')
    expect(list).toHaveClass('[&>li+li]:border-t')
    expect(list?.children).toHaveLength(2)
  })
})

describe('RelationshipList divider mechanics', () => {
  it('does not apply record separators to a single row', () => {
    const { container } = render(
      <RelationshipList.Root itemCount={1}>
        <RelationshipList.Group itemCount={1}>
          <RelationshipList.Row title="Only row" />
        </RelationshipList.Group>
      </RelationshipList.Root>,
    )

    const list = container.querySelector('ul')
    expect(list?.children).toHaveLength(1)
    expect(list).toHaveClass('[&>li+li]:border-t')
  })

  it('applies structural border-t between subsequent groups only', () => {
    const { container } = render(
      <RelationshipList.Root itemCount={2}>
        <RelationshipList.Group itemCount={1}>
          <RelationshipList.Row title="First group row" />
        </RelationshipList.Group>
        <RelationshipList.Group itemCount={1} label="Second">
          <RelationshipList.Row title="Second group row" />
        </RelationshipList.Group>
      </RelationshipList.Root>,
    )

    const root = container.querySelector('[data-slot="relationship-list-root"]')
    expect(root).toHaveClass(relationshipListRootVariants())
  })

  it('uses Footer as the sole content-to-footer structural divider', () => {
    const { container } = render(
      <RelationshipList.Root itemCount={1} action={{ label: 'Add member', onSelect: vi.fn() }}>
        <RelationshipList.Group itemCount={1}>
          <RelationshipList.Row title="Member" />
        </RelationshipList.Group>
      </RelationshipList.Root>,
    )

    const groups = container.querySelectorAll('[data-slot="relationship-list-group"]')
    const footer = container.querySelector('[data-slot="relationship-list-footer"]')

    expect(groups).toHaveLength(1)
    expect(groups[0]?.className.split(/\s+/).includes('border-b')).toBe(false)
    expect(footer).toHaveClass(relationshipListFooterVariants())
    expect(footer).toHaveClass('border-t')
  })

  it('does not double structural dividers between the last group and footer', () => {
    const { container } = render(
      <RelationshipList.Root itemCount={1} action={{ label: 'Add member', onSelect: vi.fn() }}>
        <RelationshipList.Group itemCount={1}>
          <RelationshipList.Row title="Member" />
        </RelationshipList.Group>
      </RelationshipList.Root>,
    )

    const group = container.querySelector('[data-slot="relationship-list-group"]')
    const footer = container.querySelector('[data-slot="relationship-list-footer"]')

    expect(group?.className.split(/\s+/).includes('border-b')).toBe(false)
    expect(footer?.className.match(/border-t/g)?.length).toBe(1)
  })
})

describe('RelationshipList headerAction and menu', () => {
  it('renders headerAction on empty groups', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()

    render(
      <RelationshipList.Root itemCount={1}>
        <RelationshipList.Group
          itemCount={0}
          label="Governed by"
          emptyLabel="No governing organization."
          headerAction={{ label: 'Add governing organization', onSelect: onAdd }}
        />
      </RelationshipList.Root>,
    )

    expect(screen.getByText('No governing organization.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add governing organization' }))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('uses controlSizeOverride only through menu items on rows', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <RelationshipList.Root itemCount={1}>
        <RelationshipList.Group itemCount={1}>
          <RelationshipList.Row
            title="Member"
            menu={{
              label: 'Actions for Member',
              items: [{ id: 'edit', label: 'Edit membership', onSelect }],
            }}
          />
        </RelationshipList.Group>
      </RelationshipList.Root>,
    )

    await user.click(screen.getByRole('button', { name: 'Actions for Member' }))
    await user.click(screen.getByRole('menuitem', { name: 'Edit membership' }))
    expect(onSelect).toHaveBeenCalledOnce()
  })
})

describe('RelationshipList composition invariant', () => {
  it('derives empty and footer placement solely from itemCount props', () => {
    const { rerender, container } = render(
      <RelationshipList.Root itemCount={0} emptyLabel="Empty section" />,
    )
    expect(container.querySelector('[data-slot="relationship-list-empty"]')).toBeInTheDocument()

    rerender(
      <RelationshipList.Root itemCount={1} action={{ label: 'Add', onSelect: vi.fn() }}>
        <RelationshipList.Group itemCount={1}>
          <RelationshipList.Row title="Row" />
        </RelationshipList.Group>
      </RelationshipList.Root>,
    )

    expect(container.querySelector('[data-slot="relationship-list-empty"]')).toBeNull()
    expect(container.querySelector('[data-slot="relationship-list-footer"]')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations for populated list with footer', async () => {
    const { container } = render(
      <MemoryRouter>
        <RelationshipList.Root itemCount={1} action={{ label: 'Add member', onSelect: vi.fn() }}>
          <RelationshipList.Group itemCount={1}>
            <RelationshipList.Row title="Circle Envoy" href="/npc/1" />
          </RelationshipList.Group>
        </RelationshipList.Root>
      </MemoryRouter>,
    )
    await expectNoAxeViolations(container)
  })
})
