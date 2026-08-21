import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

import { GLOBAL_SEARCH_COPY } from '../../lib/global-search-copy'
import { globalSearchGroupContentInsetClasses } from '../../lib/global-search-group.variants'
import {
  resolveGlobalSearchHeadingSurfaceClasses,
  resolveGlobalSearchRowHoverSurfaceClasses,
} from '../../lib/global-search-surface.variants'
import type { GlobalSearchGroupSection as GlobalSearchGroupSectionModel } from '../../lib/rank-global-search'
import { GlobalSearchGroupSection } from './global-search-group-section'

function rowShell(link: HTMLElement): HTMLElement {
  return link.parentElement!
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
  options?: {
    rowDensity?: 'compact' | 'default'
    surfaceContext?: 'preview' | 'page'
  },
) {
  return renderWithProviders(
    <GlobalSearchGroupSection
      section={section}
      sectionIndex={sectionIndex}
      sections={sections}
      resolveHref={() => '/campaigns/demo/spells/fireball'}
      showAllHref={() => '/campaigns/demo/search?group=content'}
      rowDensity={options?.rowDensity}
      surfaceContext={options?.surfaceContext}
    />,
  )
}

describe('GlobalSearchGroupSection', () => {
  it('renders a complete group without show-all spacing or row borders', () => {
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
    expect(container.querySelector('[class*="border-border-faint"]')).toBeInTheDocument()
    expect(rowShell(screen.getByRole('link', { name: 'Result 1, Spell' }))).toHaveClass(
      'border-b-0',
    )
    expect(rowShell(screen.getByRole('link', { name: 'Result 2, Spell' }))).toHaveClass(
      'border-b-0',
    )
  })

  it('co-locates content inset with heading chrome and list row hover shells on page', () => {
    const sections: GlobalSearchGroupSectionModel[] = [
      {
        filterGroup: 'content',
        items: [document('1')],
        totalCount: 1,
      },
    ]

    const { container } = renderSection(sections[0]!, 0, sections, { surfaceContext: 'page' })
    const heading = container.querySelector('section > div')
    const list = container.querySelector('[class*="border-border-faint"]')
    const row = rowShell(screen.getByRole('link', { name: 'Result 1, Spell' }))

    expect(heading).toHaveClass(resolveGlobalSearchHeadingSurfaceClasses('page'))
    expect(heading?.className).toContain('border-border-subtle')
    expect(heading).toHaveClass(globalSearchGroupContentInsetClasses)
    expect(list?.className).not.toContain('px-3')
    expect(row).toHaveClass(globalSearchGroupContentInsetClasses)
    expect(row).toHaveClass(resolveGlobalSearchRowHoverSurfaceClasses('page'))
    expect(row).toHaveClass('py-3')
  })

  it('uses muted headings and hover on preview surface context', () => {
    const sections: GlobalSearchGroupSectionModel[] = [
      {
        filterGroup: 'content',
        items: [document('1')],
        totalCount: 1,
      },
    ]

    const { container } = renderSection(sections[0]!, 0, sections, {
      surfaceContext: 'preview',
      rowDensity: 'compact',
    })
    const heading = container.querySelector('section > div')
    const row = rowShell(screen.getByRole('link', { name: 'Result 1, Spell' }))

    expect(heading).toHaveClass(resolveGlobalSearchHeadingSurfaceClasses('preview'))
    expect(row).toHaveClass(resolveGlobalSearchRowHoverSurfaceClasses('preview'))
    expect(row).toHaveClass('py-2')
  })

  it('adds first-heading top inset in parity with preview groups', () => {
    const sections: GlobalSearchGroupSectionModel[] = [
      {
        filterGroup: 'content',
        items: [document('1')],
        totalCount: 1,
      },
    ]

    const { container: pageContainer } = renderSection(sections[0]!, 0, sections, {
      surfaceContext: 'page',
    })
    expect(pageContainer.querySelector('section > div')).toHaveClass('pt-2')

    const { container: previewContainer } = renderSection(sections[0]!, 0, sections, {
      surfaceContext: 'preview',
    })
    expect(previewContainer.querySelector('section > div')).toHaveClass('pt-2')
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

    const { container } = renderSection(sections[1]!, 1, sections)
    const heading = container.querySelector('[class*="border-t"]')

    expect(heading?.className).toContain('border-t')
    expect(heading?.className).toContain('border-border-subtle')
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

    const { container } = renderSection(sections[1]!, 1, sections)
    const headingShell = container.querySelector('section > div')

    expect(headingShell?.className).not.toContain('border-t')
  })

  it('adds top inset on the first preview group heading', () => {
    const sections: GlobalSearchGroupSectionModel[] = [
      {
        filterGroup: 'content',
        items: [document('1')],
        totalCount: 14,
      },
    ]

    const { container } = renderSection(sections[0]!, 0, sections, {
      surfaceContext: 'preview',
    })
    const headingShell = container.querySelector('section > div')
    const showAll = screen.getByRole('link', {
      name: `${GLOBAL_SEARCH_COPY.showAllInGroup(14, 'Content')} →`,
    })

    expect(headingShell).toHaveClass('pt-2')
    expect(showAll).toHaveClass(globalSearchGroupContentInsetClasses)
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
