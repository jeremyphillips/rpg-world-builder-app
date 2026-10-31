import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { IdentityRow } from './identity-row.client'
import { DestinationList, DestinationItem } from './destination-list'
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
    expect(css).toContain(
      '.ui-destination-list--filled .ui-destination-item:not(:last-child)::after',
    )
    expect(css).toContain('left: 0')
    expect(css).toMatch(
      /\.ui-destination-list--filled\.ui-destination-list--tone-strong[^}]*--ui-surface-bg:\s*var\(--surface-strong\)/s,
    )
    expect(css).not.toMatch(
      /\.ui-destination-list--filled\.ui-destination-list--tone-strong[^}]*box-shadow:/s,
    )
    expect(css).toContain('.ui-destination-list--elevation-subtle')
    expect(css).toMatch(
      /\.ui-destination-list--elevation-subtle[\s\S]*var\(--shadow-surface-subtle\)/,
    )
    expect(css).toContain('.ui-list--compact.ui-destination-list')
    expect(css).toContain('.ui-list--spacious.ui-destination-list')
    expect(css).not.toMatch(/\.ui-destination-list--(?:compact|comfortable|spacious)\s*\{/)
  })

  it('declares stable item link geometry on ui-destination-item__link', () => {
    const css = readFileSync(destinationListCssPath, 'utf8')
    expect(css).toMatch(/\.ui-destination-item__link\s*\{[^}]*display:\s*flex/s)
    expect(css).toContain('gap: calc(var(--spacing) * 3)')
    expect(css).toContain('text-decoration: none')
  })
})

describe('DestinationList + DestinationItem', () => {
  it('renders ul > li > link structure', () => {
    const { container } = render(
      <DestinationList>
        <DestinationItem link={<a href="/a">nav</a>} title="Alpha" />
      </DestinationList>,
    )

    const list = container.querySelector('ul')
    expect(list).toBeTruthy()
    const item = container.querySelector('li.ui-destination-item')
    expect(item).toBeTruthy()
    const link = item?.querySelector('a.ui-destination-item__link')
    expect(link).toHaveAttribute('href', '/a')
  })

  it('exposes accessible name from title text', () => {
    render(
      <DestinationList>
        <DestinationItem link={<a href="/creature-types">nav</a>} title="Creature types" />
      </DestinationList>,
    )
    expect(screen.getByRole('link', { name: 'Creature types' })).toBeInTheDocument()
  })

  it('renders description and metadata together', () => {
    render(
      <DestinationList>
        <DestinationItem
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
        <DestinationItem link={<a href="/a">nav</a>} title="Alpha" />
      </DestinationList>,
    )
    expect(container.getElementsByClassName('ui-destination-item__chevron')).toHaveLength(1)

    rerender(
      <DestinationList>
        <DestinationItem link={<a href="/a">nav</a>} title="Alpha" showNavigationChevron={false} />
      </DestinationList>,
    )
    expect(container.getElementsByClassName('ui-destination-item__chevron')).toHaveLength(0)
  })

  it('applies embedded focus ring on the row link', () => {
    render(
      <DestinationList>
        <DestinationItem link={<a href="/a">nav</a>} title="Alpha" />
      </DestinationList>,
    )
    expect(screen.getByRole('link')).toHaveClass('ui-focus-ring')
    expect(screen.getByRole('link')).toHaveClass('ui-focus-ring--embedded')
  })

  it('uses hit-target pointer policy without duplicate cursor utility', () => {
    render(
      <DestinationList>
        <DestinationItem link={<a href="/a">nav</a>} title="Alpha" />
      </DestinationList>,
    )
    const link = screen.getByRole('link')
    expect(link).toHaveClass('ui-interactive-row--hit-pointer')
    expect(link.className).not.toContain('cursor-pointer')
  })

  it('applies filled elevation only when appearance is filled', () => {
    const { container, rerender } = render(
      <DestinationList appearance="filled" tone="strong" elevation="subtle">
        <DestinationItem link={<a href="/a">nav</a>} title="Alpha" />
      </DestinationList>,
    )
    expect(container.firstElementChild).toHaveClass('ui-destination-list--elevation-subtle')

    rerender(
      <DestinationList appearance="panel" tone="strong" elevation="subtle">
        <DestinationItem link={<a href="/a">nav</a>} title="Alpha" />
      </DestinationList>,
    )
    expect(container.firstElementChild).not.toHaveClass('ui-destination-list--elevation-subtle')
  })

  it('defaults filled appearance to strong tone when tone is omitted', () => {
    const { container } = render(
      <DestinationList appearance="filled">
        <DestinationItem link={<a href="/a">nav</a>} title="Alpha" />
      </DestinationList>,
    )
    expect(container.firstElementChild).toHaveClass('ui-destination-list--tone-strong')
  })

  it('does not apply filled strong row overrides on panel appearance', () => {
    const { container } = render(
      <DestinationList appearance="panel">
        <DestinationItem link={<a href="/a">nav</a>} title="Alpha" />
      </DestinationList>,
    )
    const list = container.firstElementChild!
    expect(list).not.toHaveClass('ui-destination-list--tone-strong')
    expect(list).not.toHaveClass('ui-destination-list--filled')
  })

  it('does not apply filled strong row overrides on embedded appearance', () => {
    const { container } = render(
      <DestinationList appearance="embedded">
        <DestinationItem link={<a href="/a">nav</a>} title="Alpha" />
      </DestinationList>,
    )
    expect(container.firstElementChild).not.toHaveClass('ui-destination-list--tone-strong')
  })

  it('applies filled strong chrome and ignores tone on panel appearance', () => {
    const { container, rerender } = render(
      <DestinationList appearance="filled" tone="strong" density="comfortable">
        <DestinationItem link={<a href="/a">nav</a>} title="Alpha" />
      </DestinationList>,
    )
    const list = container.firstElementChild
    expect(list).toHaveClass('ui-destination-list--filled')
    expect(list).toHaveClass('ui-destination-list--tone-strong')

    rerender(
      <DestinationList appearance="panel" tone="strong" density="comfortable">
        <DestinationItem link={<a href="/a">nav</a>} title="Alpha" />
      </DestinationList>,
    )
    expect(container.firstElementChild).not.toHaveClass('ui-destination-list--tone-strong')
  })

  it('inherits list density class without row density prop', () => {
    const { container, rerender } = render(
      <DestinationList density="compact">
        <DestinationItem link={<a href="/a">nav</a>} title="Alpha" />
      </DestinationList>,
    )
    expect(container.firstElementChild).toHaveClass('ui-list', 'ui-list--compact')
    expect(container.firstElementChild).not.toHaveClass('ui-destination-list--compact')

    rerender(
      <DestinationList density="comfortable">
        <DestinationItem link={<a href="/a">nav</a>} title="Alpha" />
      </DestinationList>,
    )
    expect(container.firstElementChild).toHaveClass('ui-list', 'ui-list--comfortable')
    expect(container.firstElementChild).not.toHaveClass('ui-destination-list--comfortable')
  })

  it('renders rich content with identity cluster and no nested anchors', () => {
    const { container } = render(
      <DestinationList appearance="embedded" density="compact">
        <DestinationItem
          link={<a href="/spell">nav</a>}
          startSlot={<span data-testid="media">M</span>}
          content={<IdentityRow heading="Fireball" classification="Spell" />}
          trailingInfo={<span data-testid="info">i</span>}
        />
      </DestinationList>,
    )
    expect(container.firstElementChild).toHaveClass('ui-destination-list--embedded')
    expect(container.querySelector('.ui-destination-item__identity-cluster')).toBeTruthy()
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
        <DestinationItem
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
