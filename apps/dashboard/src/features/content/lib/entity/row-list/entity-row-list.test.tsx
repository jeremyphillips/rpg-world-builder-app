import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { EntityRowList } from './entity-row-list'
import { entityRowListFooterVariants, entityRowListRootVariants } from './entity-row-list.variants'

describe('EntityRowList layout mechanics', () => {
  it('renders section Empty without Footer when itemCount is 0', () => {
    const { container } = render(
      <EntityRowList.Root itemCount={0} emptyLabel="No members linked." />,
    )

    expect(screen.getByText('No members linked.')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="entity-row-list-footer"]')).toBeNull()
    expect(container.querySelector('[data-slot="entity-row-list-group"]')).toBeNull()
  })

  it('renders Footer without Empty when itemCount is greater than 0', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()

    const { container } = render(
      <MemoryRouter>
        <EntityRowList.Root itemCount={1} action={{ label: 'Add member', onSelect: onAdd }}>
          <EntityRowList.Group itemCount={1}>
            <EntityRowList.Row heading="Circle Envoy" headingHref="/npc/1" />
          </EntityRowList.Group>
        </EntityRowList.Root>
      </MemoryRouter>,
    )

    expect(container.querySelector('[data-slot="entity-row-list-empty"]')).toBeNull()
    expect(container.querySelector('[data-slot="entity-row-list-footer"]')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add member' }))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('renders unlabeled Group with record-separated rows', () => {
    const { container } = render(
      <EntityRowList.Root itemCount={2}>
        <EntityRowList.Group itemCount={2}>
          <EntityRowList.Row heading="First" />
          <EntityRowList.Row heading="Second" />
        </EntityRowList.Group>
      </EntityRowList.Root>,
    )

    const list = container.querySelector('ul')
    expect(list).toHaveClass('[&>li+li]:border-t')
    expect(list?.children).toHaveLength(2)
  })

  it('forwards leadingMedia to the row anatomy', () => {
    render(
      <EntityRowList.Root itemCount={1}>
        <EntityRowList.Group itemCount={1}>
          <EntityRowList.Row
            heading="Member"
            leadingMedia={<span data-testid="leading-media">Art</span>}
          />
        </EntityRowList.Group>
      </EntityRowList.Root>,
    )

    expect(screen.getByTestId('leading-media')).toBeInTheDocument()
  })

  it('composes classification and headingAccessory in the inline suffix lane', () => {
    render(
      <MemoryRouter>
        <EntityRowList.Root itemCount={1}>
          <EntityRowList.Group itemCount={1}>
            <EntityRowList.Row
              heading="Aldric"
              headingHref="/characters/1"
              classification="NPC"
              headingAccessory="Guildmaster"
            />
          </EntityRowList.Group>
        </EntityRowList.Root>
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: 'Aldric' })
    expect(link.closest('div')?.textContent).toContain('NPC')
    expect(link.closest('div')?.textContent).toContain('Guildmaster')
  })

  it('defaults overflow label from heading when menu label is omitted', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <EntityRowList.Root itemCount={1}>
        <EntityRowList.Group itemCount={1}>
          <EntityRowList.Row
            heading="Circle Envoy"
            menu={{
              items: [{ id: 'edit', label: 'Edit membership', onSelect }],
            }}
          />
        </EntityRowList.Group>
      </EntityRowList.Root>,
    )

    await user.click(screen.getByRole('button', { name: 'Actions for Circle Envoy' }))
    await user.click(screen.getByRole('menuitem', { name: 'Edit membership' }))
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('uses custom trailing instead of menu overflow', () => {
    render(
      <EntityRowList.Root itemCount={1}>
        <EntityRowList.Group itemCount={1}>
          <EntityRowList.Row
            heading="Connection"
            trailing={{ kind: 'action', content: <button type="button">Edit</button> }}
          />
        </EntityRowList.Group>
      </EntityRowList.Root>,
    )

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Actions for Connection' })).not.toBeInTheDocument()
  })
})

describe('EntityRowList divider mechanics', () => {
  it('applies structural border-t between subsequent groups only', () => {
    const { container } = render(
      <EntityRowList.Root itemCount={2}>
        <EntityRowList.Group itemCount={1}>
          <EntityRowList.Row heading="First group row" />
        </EntityRowList.Group>
        <EntityRowList.Group itemCount={1} label="Second">
          <EntityRowList.Row heading="Second group row" />
        </EntityRowList.Group>
      </EntityRowList.Root>,
    )

    const root = container.querySelector('[data-slot="entity-row-list-root"]')
    expect(root).toHaveClass(entityRowListRootVariants())
  })

  it('uses Footer as the sole content-to-footer structural divider', () => {
    const { container } = render(
      <EntityRowList.Root itemCount={1} action={{ label: 'Add member', onSelect: vi.fn() }}>
        <EntityRowList.Group itemCount={1}>
          <EntityRowList.Row heading="Member" />
        </EntityRowList.Group>
      </EntityRowList.Root>,
    )

    const footer = container.querySelector('[data-slot="entity-row-list-footer"]')
    expect(footer).toHaveClass(entityRowListFooterVariants())
    expect(footer).toHaveClass('border-t')
  })
})

describe('EntityRowList composition invariant', () => {
  itAxe('has no axe accessibility violations for populated list with footer', async () => {
    const { container } = render(
      <MemoryRouter>
        <EntityRowList.Root itemCount={1} action={{ label: 'Add member', onSelect: vi.fn() }}>
          <EntityRowList.Group itemCount={1}>
            <EntityRowList.Row heading="Circle Envoy" headingHref="/npc/1" />
          </EntityRowList.Group>
        </EntityRowList.Root>
      </MemoryRouter>,
    )
    await expectNoAxeViolations(container)
  })
})
