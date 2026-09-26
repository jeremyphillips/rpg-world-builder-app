import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import type { GlobalSearchDocument } from '@rpg/contracts'

import { INACTIVE_ROW_BADGE_LABEL } from '@/lib/availability'
import { renderWithProviders } from '@/test/render'

import { SearchResultRow } from './global-search-result-row'

function spellDocument(overrides: Partial<GlobalSearchDocument> = {}): GlobalSearchDocument {
  return {
    id: 'content:spells:fireball',
    filterGroup: 'content',
    typeLabel: 'Spell',
    title: 'Fireball',
    secondary: '3rd-level evocation',
    target: { kind: 'spell', id: 'fireball' },
    fields: [{ text: 'Fireball', weight: 1, role: 'label' }],
    ...overrides,
  }
}

function rowShell(link: HTMLElement): HTMLElement {
  return link.parentElement!
}

describe('SearchResultRow', () => {
  it('renders presentation fields and navigates via link', () => {
    renderWithProviders(
      <SearchResultRow document={spellDocument()} href="/campaigns/c1/spells/fireball" />,
    )

    const link = screen.getByRole('link', { name: 'Fireball, Spell' })
    expect(link).toHaveAttribute('href', '/campaigns/c1/spells/fireball')
    expect(screen.getByText('3rd-level evocation')).toBeInTheDocument()
    expect(screen.getByText('Spell')).toBeInTheDocument()
    expect(screen.getByText('Fireball')).toBeInTheDocument()
  })

  it('calls onActivate when clicked', async () => {
    const user = userEvent.setup()
    const onActivate = vi.fn()

    renderWithProviders(
      <SearchResultRow
        document={spellDocument({ secondary: '' })}
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
        document={spellDocument({
          title: 'Arcane Trickster',
          secondary: 'd8 Hit Die',
          typeLabel: 'Class',
          target: { kind: 'class', id: 'arcane-trickster' },
        })}
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
      <SearchResultRow document={spellDocument()} href="/campaigns/c1/spells/fire-bolt" />,
    )

    const name = screen.getByText('Fireball')
    const classification = screen.getByText('Spell')
    const mixedHeadingRow = name.parentElement as HTMLElement

    expect(mixedHeadingRow).toContainElement(classification)
    expect(mixedHeadingRow.textContent).toContain('Fireball')
    expect(mixedHeadingRow.textContent).toContain('Spell')
  })

  it('renders a semantic fallback icon for spell hits without displayImage', () => {
    const { container } = renderWithProviders(
      <SearchResultRow document={spellDocument()} href="/campaigns/c1/spells/fireball" />,
    )

    expect(container.querySelector('.lucide-sparkles')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <SearchResultRow document={spellDocument()} href="/campaigns/c1/spells/fireball" />,
    )

    await expectNoAxeViolations(container)
  })

  it('renders relationship indicator outside the navigable link', () => {
    renderWithProviders(
      <SearchResultRow
        document={spellDocument({
          title: 'Champion',
          secondary: 'Fighter subclass',
          typeLabel: 'Subclass',
          target: { kind: 'class', id: 'champion' },
        })}
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
        document={spellDocument({
          title: 'Champion',
          secondary: 'Fighter subclass',
          typeLabel: 'Subclass',
          target: { kind: 'class', id: 'champion' },
        })}
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
