import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { INACTIVE_ROW_BADGE_LABEL } from '@/lib/availability'
import { renderWithProviders } from '@/test/render'

import { globalSearchGroupContentInsetClasses } from '../lib/global-search-group.variants'
import { SearchResultRow } from './search-result-row.client'

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
    expect(screen.getByText('Fireball')).toHaveClass('font-semibold')
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

  it('uses text-xs secondary copy by default with roomier vertical rhythm', () => {
    renderWithProviders(
      <SearchResultRow
        title="Fireball"
        secondary="3rd-level evocation · Instantaneous"
        typeLabel="Spell"
        href="/campaigns/c1/spells/fireball"
        borderless
      />,
    )

    const secondary = screen.getByText('3rd-level evocation · Instantaneous')
    const link = screen.getByRole('link', { name: 'Fireball, Spell' })

    expect(secondary).toHaveClass('text-xs')
    expect(secondary).not.toHaveClass('truncate')
    expect(secondary).not.toHaveClass('mt-1')
    expect(link).toHaveClass(
      'py-3',
      globalSearchGroupContentInsetClasses,
      'hover:bg-surface-subtle',
    )
  })

  it('uses compact density for tighter py and truncated secondary copy', () => {
    renderWithProviders(
      <SearchResultRow
        title="Fireball"
        secondary="3rd-level evocation · Instantaneous · Extra detail"
        typeLabel="Spell"
        href="/campaigns/c1/spells/fireball"
        density="compact"
        borderless
      />,
    )

    const secondary = screen.getByText('3rd-level evocation · Instantaneous · Extra detail')
    expect(secondary).toHaveClass('text-xs', 'truncate')
    expect(screen.getByRole('link', { name: 'Fireball, Spell' })).toHaveClass(
      'py-2',
      'border-b-0',
      globalSearchGroupContentInsetClasses,
      'hover:bg-surface-subtle',
    )
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

    expect(screen.getByRole('link', { name: 'Fireball, Spell' })).toHaveClass('border-b-0')
    expect(screen.getByRole('link', { name: 'Fireball, Spell' })).not.toHaveClass('border-border')
  })

  it('has no axe accessibility violations', async () => {
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
})
