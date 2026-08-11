import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { INACTIVE_ROW_BADGE_LABEL } from '@/lib/availability'
import { renderWithProviders } from '@/test/render'

import { globalSearchGroupContentInsetClasses } from '../lib/global-search-group.variants'
import { SearchResultRow } from './search-result-row.client'

function rowShell(link: HTMLElement): HTMLElement {
  return link.parentElement!
}

function entityItemRoot(link: HTMLElement): HTMLElement {
  return link.nextElementSibling!.firstElementChild as HTMLElement
}

function entityItemAnatomy(link: HTMLElement): HTMLElement {
  return entityItemRoot(link).firstElementChild as HTMLElement
}

describe('SearchResultRow', () => {
  it('renders presentation fields and navigates via link', () => {
    renderWithProviders(
      <SearchResultRow
        title="Fireball"
        secondary="3rd-level evocation"
        typeLabel="Spell"
        href="/campaigns/c1/spells/fireball"
      />,
    )

    const link = screen.getByRole('link', { name: 'Fireball, Spell' })
    expect(link).toHaveAttribute('href', '/campaigns/c1/spells/fireball')
    expect(screen.getByText('3rd-level evocation')).toBeInTheDocument()
    expect(screen.getByText('Spell')).toBeInTheDocument()
    expect(screen.getByText('Fireball')).toHaveClass('font-body-emphasis')
  })

  it('calls onActivate when clicked', async () => {
    const user = userEvent.setup()
    const onActivate = vi.fn()

    renderWithProviders(
      <SearchResultRow
        title="Fireball"
        secondary=""
        typeLabel="Spell"
        href="/campaigns/c1/spells/fireball"
        onActivate={onActivate}
      />,
    )

    await user.click(screen.getByRole('link', { name: 'Fireball, Spell' }))
    expect(onActivate).toHaveBeenCalledOnce()
  })

  it('shows inactive content inline with the title for managers', () => {
    renderWithProviders(
      <SearchResultRow
        title="Arcane Trickster"
        secondary="d8 Hit Die"
        typeLabel="Class"
        href="/campaigns/c1/classes/arcane-trickster"
        campaignUnavailable
      />,
    )

    expect(screen.getByText(INACTIVE_ROW_BADGE_LABEL)).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: `Arcane Trickster, ${INACTIVE_ROW_BADGE_LABEL}, Class`,
      }),
    ).toBeInTheDocument()
  })

  it('keeps row inset on the host and EntityItem inset-free for default page rows', () => {
    renderWithProviders(
      <SearchResultRow
        title="Fireball"
        secondary="3rd-level evocation · Instantaneous"
        typeLabel="Spell"
        href="/campaigns/c1/spells/fireball"
        borderless
        density="default"
        surfaceContext="page"
      />,
    )

    const secondary = screen.getByText('3rd-level evocation · Instantaneous')
    const link = screen.getByRole('link', { name: 'Fireball, Spell' })
    const row = rowShell(link)
    const root = entityItemRoot(link)
    const anatomy = entityItemAnatomy(link)

    expect(row).toHaveClass(globalSearchGroupContentInsetClasses, 'py-3')
    expect(root.className).not.toMatch(/\bpx-/)
    expect(root.className).not.toMatch(/\bpy-/)
    expect(anatomy.className).not.toMatch(/\bpx-/)
    expect(anatomy.className).not.toMatch(/\bpy-/)
    expect(secondary).toHaveClass('text-sm', 'truncate')
  })

  it('keeps compact preview rows on py-2 host inset', () => {
    renderWithProviders(
      <SearchResultRow
        title="Fireball"
        secondary="3rd-level evocation · Instantaneous · Extra detail"
        typeLabel="Spell"
        href="/campaigns/c1/spells/fireball"
        density="compact"
        borderless
        surfaceContext="preview"
      />,
    )

    const secondary = screen.getByText('3rd-level evocation · Instantaneous · Extra detail')
    const row = rowShell(screen.getByRole('link', { name: 'Fireball, Spell' }))

    expect(row).toHaveClass(
      'border-b-0',
      globalSearchGroupContentInsetClasses,
      'py-2',
      'hover:bg-surface-muted',
    )
    expect(secondary).toHaveClass('text-xs', 'truncate')
  })

  it('keeps trailing in column 3 while the host owns inset', () => {
    renderWithProviders(
      <SearchResultRow
        title="Champion"
        secondary="Fighter subclass"
        typeLabel="Subclass"
        href="/campaigns/c1/classes/fighter/subclasses/champion"
        borderless
        viewerCharacterRelationships={{
          count: 1,
          groups: [
            {
              kind: 'subclass',
              count: 1,
              relationships: [{ kind: 'subclass', characterId: '1', characterName: 'Aric' }],
            },
          ],
        }}
      />,
    )

    const link = screen.getByRole('link', { name: 'Champion, Subclass of Aric, Subclass' })
    const row = rowShell(link)
    const trailing = entityItemAnatomy(link).querySelector('[data-entity-item-slot="trailing"]')

    expect(row).toHaveClass(globalSearchGroupContentInsetClasses, 'py-3')
    expect(trailing).toHaveClass('col-start-3', 'justify-self-end')
  })

  it('removes row borders when borderless for parent-owned list separators', () => {
    renderWithProviders(
      <SearchResultRow
        title="Fireball"
        secondary="3rd-level evocation"
        typeLabel="Spell"
        href="/campaigns/c1/spells/fireball"
        borderless
      />,
    )

    const row = rowShell(screen.getByRole('link', { name: 'Fireball, Spell' }))

    expect(row).toHaveClass('border-b-0')
    expect(row).not.toHaveClass('border-border')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <SearchResultRow
        title="Fireball"
        secondary="3rd-level evocation"
        typeLabel="Spell"
        href="/campaigns/c1/spells/fireball"
      />,
    )

    await expectNoAxeViolations(container)
  })

  it('renders relationship indicator outside the navigable link', () => {
    renderWithProviders(
      <SearchResultRow
        title="Champion"
        secondary="Fighter subclass"
        typeLabel="Subclass"
        href="/campaigns/c1/classes/fighter/subclasses/champion"
        viewerCharacterRelationships={{
          count: 1,
          groups: [
            {
              kind: 'subclass',
              count: 1,
              relationships: [{ kind: 'subclass', characterId: '1', characterName: 'Aric' }],
            },
          ],
        }}
      />,
    )

    const link = screen.getByRole('link', { name: 'Champion, Subclass of Aric, Subclass' })
    expect(link).toHaveAttribute('href', '/campaigns/c1/classes/fighter/subclasses/champion')
    expect(screen.getByRole('img', { name: 'Subclass of Aric' })).toBeInTheDocument()
    expect(link).not.toContainElement(screen.getByRole('img', { name: 'Subclass of Aric' }))
  })

  itAxe('has no axe accessibility violations with relationships', async () => {
    const { container } = renderWithProviders(
      <SearchResultRow
        title="Champion"
        secondary="Fighter subclass"
        typeLabel="Subclass"
        href="/campaigns/c1/classes/fighter/subclasses/champion"
        viewerCharacterRelationships={{
          count: 1,
          groups: [
            {
              kind: 'subclass',
              count: 1,
              relationships: [{ kind: 'subclass', characterId: '1', characterName: 'Aric' }],
            },
          ],
        }}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
