import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

import { GLOBAL_SEARCH_COPY } from '../../lib/global-search-copy'
import { globalSearchGroupContentInsetClasses } from '../../lib/global-search-group.variants'
import type { GlobalSearchGroupSection as GlobalSearchGroupSectionModel } from '../../lib/rank-global-search'
import { GlobalSearchGroupSection } from './global-search-group-section'

function rowShell(link: HTMLElement): HTMLElement {
  return link
}

function document(
  id: string,
  filterGroup: GlobalSearchGroupSectionModel['filterGroup'] = 'content',
) {
  return {
    id,
    filterGroup,
    typeLabel: 'Spell',
    title: `Result ${id}`,
    secondary: 'Secondary line',
    target: { kind: 'spell' as const, id },
    fields: [{ text: `Result ${id}`, weight: 1, role: 'label' as const }],
  }
}

function renderSection(
  section: GlobalSearchGroupSectionModel,
  sectionIndex: number,
  sections: readonly GlobalSearchGroupSectionModel[],
) {
  return renderWithProviders(
    <GlobalSearchGroupSection
      section={section}
      sectionIndex={sectionIndex}
      sections={sections}
      resolveHref={() => '/campaigns/demo/spells/fireball'}
      showAllHref={() => '/campaigns/demo/search?group=content'}
    />,
  )
}

describe('GlobalSearchGroupSection', () => {
  it('renders a complete group without show-all spacing', () => {
    const sections: GlobalSearchGroupSectionModel[] = [
      {
        filterGroup: 'game-terms',
        items: [document('1', 'game-terms'), document('2', 'game-terms')],
        totalCount: 2,
      },
    ]

    const { container } = renderSection(sections[0]!, 0, sections)

    expect(screen.queryByRole('link', { name: /Show all/i })).not.toBeInTheDocument()
    expect(container.querySelector('section')).not.toHaveClass('pb-4')
    expect(container.querySelector('.divide-y')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Game terms · 2/i })).toBeInTheDocument()
  })

  it('uses shared list-result heading and list chrome', () => {
    const sections: GlobalSearchGroupSectionModel[] = [
      {
        filterGroup: 'content',
        items: [document('1')],
        totalCount: 1,
      },
    ]

    const { container } = renderSection(sections[0]!, 0, sections)
    const heading = screen.getByRole('heading', { name: /Content · 1/i })
    const list = container.querySelector('.bg-surface-lift')
    const row = rowShell(screen.getByRole('link', { name: 'Result 1, Spell' }))

    expect(heading).toHaveClass('bg-surface-faint', 'pt-2')
    expect(list).toHaveClass('divide-y', 'divide-border-faint')
    expect(row).toHaveClass('px-3', 'py-2')
  })

  it('renders truncated groups with show-all and bottom spacing', () => {
    const sections: GlobalSearchGroupSectionModel[] = [
      {
        filterGroup: 'content',
        items: [document('1')],
        totalCount: 14,
      },
    ]

    const { container } = renderSection(sections[0]!, 0, sections)

    expect(
      screen.getByRole('link', {
        name: `${GLOBAL_SEARCH_COPY.showAllInGroup(14, 'Content')} →`,
      }),
    ).toBeInTheDocument()
    expect(container.querySelector('section')).toHaveClass('pb-4')
    expect(screen.getByRole('link', { name: /Show all/i })).toHaveClass(
      globalSearchGroupContentInsetClasses,
    )
  })

  it('adds a top border when following a complete group', () => {
    const sections: GlobalSearchGroupSectionModel[] = [
      {
        filterGroup: 'game-terms',
        items: [document('1', 'game-terms')],
        totalCount: 1,
      },
      {
        filterGroup: 'content',
        items: [document('2')],
        totalCount: 14,
      },
    ]

    renderSection(sections[1]!, 1, sections)
    const heading = screen.getByRole('heading', { name: /Content · 14/i })

    expect(heading.className).toContain('border-t')
    expect(heading.className).toContain('border-border-subtle')
  })

  it('omits a top border when following a truncated group', () => {
    const sections: GlobalSearchGroupSectionModel[] = [
      {
        filterGroup: 'content',
        items: [document('1')],
        totalCount: 14,
      },
      {
        filterGroup: 'game-terms',
        items: [document('2', 'game-terms')],
        totalCount: 1,
      },
    ]

    renderSection(sections[1]!, 1, sections)
    const heading = screen.getByRole('heading', { name: /Game terms · 1/i })

    expect(heading.className).not.toContain('border-t')
  })

  itAxe('has no axe accessibility violations', async () => {
    const sections: GlobalSearchGroupSectionModel[] = [
      {
        filterGroup: 'content',
        items: [document('1')],
        totalCount: 14,
      },
    ]

    const { container } = renderSection(sections[0]!, 0, sections)

    await expectNoAxeViolations(container)
  })
})
