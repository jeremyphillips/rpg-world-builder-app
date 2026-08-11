import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { DetailEntityRow } from './detail-entity-row.client'
import { DetailSectionRowList } from '../section/detail-section-row-list.client'

describe('DetailEntityRow', () => {
  it('renders heading link, inline heading suffix, and end slot with row padding', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailEntityRow
          heading="The Silver Eel"
          headingHref="/locations/silver-eel"
          headingSuffix=" · Building · Tavern"
          trailing={{ kind: 'action', content: <button type="button">Actions</button> }}
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
          headingHref="/characters/braggi"
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
          headingHref="/characters/verna"
          headingSuffix=" · PC · Elf (Drow) · Level 8 · Fighter 5 (Battle Master) / Rogue 3 (Assassin)"
          trailing={{ kind: 'action', content: <button type="button">Actions</button> }}
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
        <DetailEntityRow heading="Harborford" headingHref="/locations/harborford" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Harborford' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders an ordinary row without leading disclosure chrome when disclosure is omitted', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailEntityRow heading="Harborford" headingHref="/locations/harborford" />
      </MemoryRouter>,
    )

    expect(container.firstElementChild).toHaveClass('min-w-0', 'py-1', 'px-4')
    expect(screen.queryByRole('button', { name: /show/i })).not.toBeInTheDocument()
  })

  it('renders disclosure collapsed by default and toggles expanded content', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <DetailEntityRow
          heading="Dock Ward"
          headingHref="/locations/dock-ward"
          disclosure={{
            mode: 'expandable',
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
          headingHref="/locations/dock-ward"
          trailing={{ kind: 'action', content: <button type="button">Actions</button> }}
          disclosure={{
            mode: 'expandable',
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
          headingHref="/locations/dock-ward"
          disclosure={{
            mode: 'expandable',
            label: 'locations in Dock Ward',
            content: <span>Preview child</span>,
          }}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Show locations in Dock Ward' }))

    const expandedRegion = container.querySelector('[id]')
    expect(expandedRegion).toHaveClass('pl-[var(--entity-leading-offset)]')
    expect(expandedRegion?.firstElementChild).toHaveClass(
      'border-l',
      'border-border-subtle',
      'pl-3',
    )
  })

  it('keeps parent and preview as one list child without an inner divider', async () => {
    const user = userEvent.setup()

    const { container } = render(
      <MemoryRouter>
        <DetailSectionRowList separator="structural">
          <DetailEntityRow
            heading="Dock Ward"
            headingHref="/locations/dock-ward"
            disclosure={{
              mode: 'expandable',
              label: 'locations in Dock Ward',
              content: (
                <DetailSectionRowList separator="structural">
                  <DetailEntityRow
                    heading="Yawning Portal"
                    headingHref="/locations/yawning-portal"
                  />
                </DetailSectionRowList>
              ),
            }}
          />
          <DetailEntityRow heading="Market Ward" headingHref="/locations/market-ward" />
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

  it('renders reserved disclosure with the same outer wrapper and column token as expandable', () => {
    const { container: expandableContainer } = render(
      <MemoryRouter>
        <DetailEntityRow
          heading="Dock Ward"
          headingHref="/locations/dock-ward"
          disclosure={{
            mode: 'expandable',
            label: 'locations in Dock Ward',
            content: <span>Preview child</span>,
          }}
        />
      </MemoryRouter>,
    )

    const { container: reservedContainer } = render(
      <MemoryRouter>
        <DetailEntityRow
          heading="Market Ward"
          headingHref="/locations/market-ward"
          disclosure={{ mode: 'reserved' }}
        />
      </MemoryRouter>,
    )

    const expandableItem = expandableContainer.firstElementChild as HTMLElement | null
    const reservedItem = reservedContainer.firstElementChild as HTMLElement | null

    expect(expandableItem?.style.getPropertyValue('--leading-chrome-size')).toBe(
      'calc(var(--spacing)*6)',
    )
    expect(reservedItem?.style.getPropertyValue('--leading-chrome-size')).toBe(
      'calc(var(--spacing)*6)',
    )
    expect(expandableItem?.style.getPropertyValue('--leading-chrome-gap')).toBe(
      'calc(var(--spacing)*1)',
    )
    expect(expandableItem?.style.getPropertyValue('--entity-leading-offset')).toContain(
      '--leading-chrome-size',
    )
    expect(expandableItem?.querySelector('[class*="w-[var(--leading-chrome-size)]"]')).toBeTruthy()
    expect(reservedItem?.querySelector('[class*="w-[var(--leading-chrome-size)]"]')).toBeTruthy()
  })

  it('keeps reserved disclosure out of tab order with no expand affordance', () => {
    render(
      <MemoryRouter>
        <DetailEntityRow
          heading="Market Ward"
          headingHref="/locations/market-ward"
          disclosure={{ mode: 'reserved' }}
        />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('button', { name: /show/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /hide/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Market Ward' })).toBeInTheDocument()
  })

  it('keeps list separators between disclosure items when one row is reserved', () => {
    const { container } = render(
      <MemoryRouter>
        <DetailSectionRowList separator="structural">
          <DetailEntityRow
            heading="Market Ward"
            headingHref="/locations/market-ward"
            disclosure={{ mode: 'reserved' }}
          />
          <DetailEntityRow
            heading="Dock Ward"
            headingHref="/locations/dock-ward"
            disclosure={{
              mode: 'expandable',
              label: 'locations in Dock Ward',
              content: <span>Preview child</span>,
            }}
          />
        </DetailSectionRowList>
      </MemoryRouter>,
    )

    expect(container.firstElementChild?.children).toHaveLength(2)
  })
})
