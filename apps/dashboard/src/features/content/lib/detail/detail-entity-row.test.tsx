import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { DetailEntityRow } from './detail-entity-row.client'
import { DetailSectionRowList } from './detail-section-row-list.client'

describe('DetailEntityRow', () => {
  it('renders heading link, inline heading suffix, and end slot with row padding', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailEntityRow
          heading="The Silver Eel"
          href="/locations/silver-eel"
          headingSuffix=" · Building · Tavern"
          endSlot={<button type="button">Actions</button>}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'The Silver Eel' })).toHaveAttribute(
      'href',
      '/locations/silver-eel',
    )
    expect(
      screen.getByRole('link', { name: 'The Silver Eel' }).parentElement?.parentElement,
    ).toHaveTextContent('The Silver Eel·Building · Tavern')
    expect(screen.getByText('Building · Tavern')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Actions' })).toBeInTheDocument()
    expect(container.firstElementChild).toHaveClass('px-4', 'py-1')
  })

  it('keeps the leading separator visible beside a non-shrinking entity name', () => {
    render(
      <MemoryRouter>
        <DetailEntityRow
          heading="Braggi"
          href="/characters/braggi"
          headingSuffix=" · NPC · Human · Level 3 Fighter"
        />
      </MemoryRouter>,
    )

    const headingRow = screen.getByRole('link', { name: 'Braggi' }).parentElement?.parentElement
    expect(headingRow).toHaveTextContent('Braggi·NPC · Human · Level 3 Fighter')
    expect(screen.getByText('NPC · Human · Level 3 Fighter')).toBeInTheDocument()
    expect(headingRow?.querySelector('[aria-hidden="true"]')).toHaveTextContent('·')
  })

  it('truncates the heading suffix before the entity name', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailEntityRow
          heading="Verna Stormcaller"
          href="/characters/verna"
          headingSuffix=" · PC · Elf (Drow) · Level 8 · Fighter 5 (Battle Master) / Rogue 3 (Assassin)"
          endSlot={<button type="button">Actions</button>}
        />
      </MemoryRouter>,
    )

    const suffix = container.querySelector('[class*="flex-1"][class*="truncate"]')
    expect(suffix).toHaveClass('truncate')
    expect(screen.getByRole('link', { name: 'Verna Stormcaller' })).toHaveClass('text-link')
    expect(screen.getByRole('link', { name: 'Verna Stormcaller' }).parentElement).toHaveClass(
      'shrink-0',
    )
    expect(screen.getByRole('button', { name: 'Actions' })).toBeInTheDocument()
  })

  it('omits end slot when not provided', () => {
    render(
      <MemoryRouter>
        <DetailEntityRow heading="Harborford" href="/locations/harborford" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Harborford' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders an ordinary row without leading disclosure chrome when disclosure is omitted', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailEntityRow heading="Harborford" href="/locations/harborford" />
      </MemoryRouter>,
    )

    expect(container.firstElementChild).toHaveClass('flex', 'items-center')
    expect(screen.queryByRole('button', { name: /show/i })).not.toBeInTheDocument()
  })

  it('renders disclosure collapsed by default and toggles expanded content', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <DetailEntityRow
          heading="Dock Ward"
          href="/locations/dock-ward"
          disclosure={{
            label: 'locations in Dock Ward',
            content: <a href="/locations/yawning-portal">Yawning Portal</a>,
          }}
        />
      </MemoryRouter>,
    )

    const toggle = screen.getByRole('button', { name: 'Show locations in Dock Ward' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: 'Yawning Portal' })).not.toBeInTheDocument()

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAccessibleName('Hide locations in Dock Ward')
    expect(screen.getByRole('link', { name: 'Yawning Portal' })).toBeInTheDocument()
  })

  it('keeps title link and end slot independent from disclosure toggle', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <DetailEntityRow
          heading="Dock Ward"
          href="/locations/dock-ward"
          endSlot={<button type="button">Actions</button>}
          disclosure={{
            label: 'locations in Dock Ward',
            content: <span>Preview child</span>,
          }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Dock Ward' })).toHaveAttribute(
      'href',
      '/locations/dock-ward',
    )
    expect(screen.getByRole('button', { name: 'Actions' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Show locations in Dock Ward' }))
    expect(screen.getByText('Preview child')).toBeInTheDocument()
  })

  it('owns disclosure gutter inset on the expanded region wrapper', async () => {
    const user = userEvent.setup()

    const { container } = render(
      <MemoryRouter>
        <DetailEntityRow
          heading="Dock Ward"
          href="/locations/dock-ward"
          disclosure={{
            label: 'locations in Dock Ward',
            content: <span>Preview child</span>,
          }}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Show locations in Dock Ward' }))

    const expandedRegion = container.querySelector('[id]')
    expect(expandedRegion).toHaveClass('pl-[var(--content-column-indent)]')
  })

  it('keeps parent and preview as one list child without an inner divider', async () => {
    const user = userEvent.setup()

    const { container } = render(
      <MemoryRouter>
        <DetailSectionRowList>
          <DetailEntityRow
            heading="Dock Ward"
            href="/locations/dock-ward"
            disclosure={{
              label: 'locations in Dock Ward',
              content: (
                <DetailSectionRowList>
                  <DetailEntityRow heading="Yawning Portal" href="/locations/yawning-portal" />
                </DetailSectionRowList>
              ),
            }}
          />
          <DetailEntityRow heading="Market Ward" href="/locations/market-ward" />
        </DetailSectionRowList>
      </MemoryRouter>,
    )

    const outerList = container.firstElementChild
    expect(outerList?.children).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Show locations in Dock Ward' }))

    const disclosureItem = screen.getByRole('link', { name: 'Dock Ward' }).closest('[style]')
    const expandedRegion = disclosureItem?.querySelector('[id]')
    expect(expandedRegion).toBeInTheDocument()
    expect(expandedRegion?.previousElementSibling).not.toHaveClass('border-t')
    expect(expandedRegion).not.toHaveClass('border-t')
    expect(screen.getByRole('link', { name: 'Yawning Portal' })).toBeInTheDocument()
  })
})
