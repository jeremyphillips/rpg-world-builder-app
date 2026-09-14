import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { INACTIVE_ROW_BADGE_LABEL } from '@/lib/availability'
import { renderWithProviders } from '@/test/render'

import { SearchResultRow } from './global-search-result-row'

function rowShell(link: HTMLElement): HTMLElement {
  return link.parentElement!
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

  it('keeps classification adjacent to the title', () => {
    renderWithProviders(
      <SearchResultRow
        title="Fire Bolt"
        secondary="Evocation cantrip"
        typeLabel="Spell"
        href="/campaigns/c1/spells/fire-bolt"
      />,
    )

    const name = screen.getByText('Fire Bolt')
    const classification = screen.getByText('Spell')
    const mixedHeadingRow = name.parentElement as HTMLElement

    expect(mixedHeadingRow.childNodes[0]).toBe(name)
    expect(mixedHeadingRow.childNodes[2]).toBe(classification)
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
    expect(rowShell(link)).toContainElement(screen.getByRole('img', { name: 'Subclass of Aric' }))
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
