import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { IdentityRow } from './identity-row.client'
import { DestinationList, DestinationRow } from './destination-list'
import {
  UI_DESTINATION_ITEM_CLASS,
  UI_DESTINATION_LIST_COMPACT_CLASS,
  UI_DESTINATION_LIST_COMFORTABLE_CLASS,
  UI_DESTINATION_LIST_EMBEDDED_CLASS,
  UI_DESTINATION_ROW_CHEVRON_CLASS,
  UI_DESTINATION_ROW_CLASS,
  UI_DESTINATION_ROW_IDENTITY_CLUSTER_CLASS,
} from './destination-list.variants'

const destinationListCssPath = join(dirname(fileURLToPath(import.meta.url)), 'destination-list.css')

describe('destination-list.css inset divider contract', () => {
  it('declares list-owned inset separators on items', () => {
    const css = readFileSync(destinationListCssPath, 'utf8')
    expect(css).toContain(
      '.ui-destination-list--panel .ui-destination-item:not(:last-child)::after',
    )
    expect(css).toContain(
      '.ui-destination-list--embedded .ui-destination-item + .ui-destination-item',
    )
    expect(css).toContain('left: var(--ui-destination-inset-inline)')
    expect(css).toContain('right: var(--ui-destination-inset-inline)')
  })

  it('declares stable row link geometry on ui-destination-row', () => {
    const css = readFileSync(destinationListCssPath, 'utf8')
    expect(css).toMatch(/\.ui-destination-row\s*\{[^}]*display:\s*flex/s)
    expect(css).toContain('gap: calc(var(--spacing) * 3)')
    expect(css).toContain('text-decoration: none')
  })
})

describe('DestinationList + DestinationRow', () => {
  it('renders ul > li > link structure', () => {
    const { container } = render(
      <DestinationList>
        <DestinationRow link={<a href="/a">nav</a>} title="Alpha" />
      </DestinationList>,
    )

    const list = container.querySelector('ul')
    expect(list).toBeTruthy()
    const item = container.querySelector(`li.${UI_DESTINATION_ITEM_CLASS}`)
    expect(item).toBeTruthy()
    const link = item?.querySelector(`a.${UI_DESTINATION_ROW_CLASS}`)
    expect(link).toHaveAttribute('href', '/a')
  })

  it('exposes accessible name from title text', () => {
    render(
      <DestinationList>
        <DestinationRow link={<a href="/creature-types">nav</a>} title="Creature types" />
      </DestinationList>,
    )
    expect(screen.getByRole('link', { name: 'Creature types' })).toBeInTheDocument()
  })

  it('renders description and metadata together', () => {
    render(
      <DestinationList>
        <DestinationRow
          link={<a href="/x">nav</a>}
          title="Damage types"
          description="Energy and physical categories."
          metadata={<span>13 terms</span>}
        />
      </DestinationList>,
    )
    expect(screen.getByText('Energy and physical categories.')).toBeInTheDocument()
    expect(screen.getByText('13 terms')).toBeInTheDocument()
  })

  it('shows navigation chevron by default and hides when opted out', () => {
    const { container, rerender } = render(
      <DestinationList>
        <DestinationRow link={<a href="/a">nav</a>} title="Alpha" />
      </DestinationList>,
    )
    expect(container.getElementsByClassName(UI_DESTINATION_ROW_CHEVRON_CLASS)).toHaveLength(1)

    rerender(
      <DestinationList>
        <DestinationRow link={<a href="/a">nav</a>} title="Alpha" showNavigationChevron={false} />
      </DestinationList>,
    )
    expect(container.getElementsByClassName(UI_DESTINATION_ROW_CHEVRON_CLASS)).toHaveLength(0)
  })

  it('applies embedded focus ring on the row link', () => {
    render(
      <DestinationList>
        <DestinationRow link={<a href="/a">nav</a>} title="Alpha" />
      </DestinationList>,
    )
    expect(screen.getByRole('link')).toHaveClass('ui-focus-ring')
    expect(screen.getByRole('link')).toHaveClass('ui-focus-ring--embedded')
  })

  it('uses hit-target pointer policy without duplicate cursor utility', () => {
    render(
      <DestinationList>
        <DestinationRow link={<a href="/a">nav</a>} title="Alpha" />
      </DestinationList>,
    )
    const link = screen.getByRole('link')
    expect(link).toHaveClass('ui-interactive-row--hit-pointer')
    expect(link.className).not.toContain('cursor-pointer')
  })

  it('inherits list density class without row density prop', () => {
    const { container, rerender } = render(
      <DestinationList density="compact">
        <DestinationRow link={<a href="/a">nav</a>} title="Alpha" />
      </DestinationList>,
    )
    expect(container.firstElementChild).toHaveClass(UI_DESTINATION_LIST_COMPACT_CLASS)

    rerender(
      <DestinationList density="comfortable">
        <DestinationRow link={<a href="/a">nav</a>} title="Alpha" />
      </DestinationList>,
    )
    expect(container.firstElementChild).toHaveClass(UI_DESTINATION_LIST_COMFORTABLE_CLASS)
  })

  it('renders rich content with identity cluster and no nested anchors', () => {
    const { container } = render(
      <DestinationList appearance="embedded" density="compact">
        <DestinationRow
          link={<a href="/spell">nav</a>}
          startSlot={<span data-testid="media">M</span>}
          content={<IdentityRow heading="Fireball" classification="Spell" size="md" />}
          trailingInfo={<span data-testid="info">i</span>}
        />
      </DestinationList>,
    )
    expect(container.firstElementChild).toHaveClass(UI_DESTINATION_LIST_EMBEDDED_CLASS)
    expect(container.querySelector(`.${UI_DESTINATION_ROW_IDENTITY_CLUSTER_CLASS}`)).toBeTruthy()
    expect(screen.getByTestId('media')).toBeInTheDocument()
    expect(screen.getByTestId('info')).toBeInTheDocument()
    expect(container.querySelectorAll('a a')).toHaveLength(0)
    expect(container.querySelectorAll('a button')).toHaveLength(0)
  })

  it('activates link on Enter when focused', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault()
    })
    render(
      <DestinationList>
        <DestinationRow
          link={
            <a href="/dest" onClick={onClick}>
              nav
            </a>
          }
          title="Category"
        />
      </DestinationList>,
    )
    const link = screen.getByRole('link', { name: 'Category' })
    link.focus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalled()
  })
})
