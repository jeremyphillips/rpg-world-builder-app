import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

import { GLOBAL_SEARCH_COPY } from '../lib/global-search-copy'
import type { GlobalSearchGroupSection as GlobalSearchGroupSectionModel } from '../lib/rank-global-search'
import { GlobalSearchGroupSection } from './global-search-group-section.client'

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
  inset?: 'panel',
) {
  return renderWithProviders(
    <GlobalSearchGroupSection
      section={section}
      sectionIndex={sectionIndex}
      sections={sections}
      resolveHref={() => '/campaigns/demo/spells/fireball'}
      showAllHref={() => '/campaigns/demo/search?group=content'}
      inset={inset}
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
    expect(screen.getByRole('link', { name: 'Result 1, Spell' })).toHaveClass('border-b-0')
    expect(screen.getByRole('link', { name: 'Result 2, Spell' })).toHaveClass('border-b-0')
  })

  it('uses faint subtle heading chrome on the page layout', () => {
    const sections: GlobalSearchGroupSectionModel[] = [
      {
        filterGroup: 'content',
        items: [document('1')],
        totalCount: 1,
      },
    ]

    const { container } = renderSection(sections[0]!, 0, sections)
    const heading = container.querySelector('section > div')

    expect(heading?.className).toContain('bg-surface-faint')
    expect(heading?.className).toContain('border-border-subtle')
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

  it('applies panel inset padding only in preview layout', () => {
    const sections: GlobalSearchGroupSectionModel[] = [
      {
        filterGroup: 'content',
        items: [document('1')],
        totalCount: 1,
      },
    ]

    const { container } = renderSection(sections[0]!, 0, sections, 'panel')
    const heading = container.querySelector('section > div')

    expect(heading).toHaveClass('pt-2')
    expect(screen.getByText('Content').closest('[class*="px-3"]')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
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
