import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

import { GLOBAL_SEARCH_COPY } from '../lib/global-search-copy'
import type { GlobalSearchGroupSection } from '../lib/rank-global-search'
import { GlobalSearchPreviewGroupSection } from './global-search-preview-group-section.client'

function document(id: string, filterGroup: GlobalSearchGroupSection['filterGroup'] = 'content') {
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
  section: GlobalSearchGroupSection,
  sectionIndex: number,
  sections: readonly GlobalSearchGroupSection[],
) {
  return renderWithProviders(
    <GlobalSearchPreviewGroupSection
      section={section}
      sectionIndex={sectionIndex}
      sections={sections}
      resolveHref={() => '/campaigns/demo/spells/fireball'}
      showAllHref={() => '/campaigns/demo/search?group=content'}
    />,
  )
}

describe('GlobalSearchPreviewGroupSection', () => {
  it('renders a complete group without show-all spacing or row borders', () => {
    const sections: GlobalSearchGroupSection[] = [
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
    expect(screen.getByRole('link', { name: 'Result 1, Spell' })).toHaveClass('border-b-0')
  })

  it('renders truncated groups with show-all and bottom spacing', () => {
    const sections: GlobalSearchGroupSection[] = [
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
    const sections: GlobalSearchGroupSection[] = [
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
  })

  it('omits a top border when following a truncated group', () => {
    const sections: GlobalSearchGroupSection[] = [
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

  it('has no axe accessibility violations', async () => {
    const sections: GlobalSearchGroupSection[] = [
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
