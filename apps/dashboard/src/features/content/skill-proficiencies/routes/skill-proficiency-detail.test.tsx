import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { formatSlugAsLabel } from '@rpg/contracts'
import type { CharacterClass } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

vi.mock('@/components/layout/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))
vi.mock('../../classes/hooks/use-classes')
vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(() => false),
}))

import { useClasses as useClassesFn } from '../../classes/hooks/use-classes'
import { FIGHTER } from '../../classes/fixtures'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { ATHLETICS } from '../fixtures'
import { SkillDetailContent } from './skill-proficiency-detail'

const useClasses = vi.mocked(useClassesFn)

function mockClassesQuery(
  overrides: Partial<ReturnType<typeof useClassesFn>> & { data?: CharacterClass[] },
) {
  useClasses.mockReturnValue({
    data: overrides.data ?? [],
    isPending: false,
    isError: false,
    error: null,
    isLoading: false,
    isFetching: false,
    ...overrides,
  } as ReturnType<typeof useClassesFn>)
}

function renderSkillDetail(skill: typeof ATHLETICS) {
  return render(
    <MemoryRouter>
      <SkillDetailContent skill={skill} campaignId={STORY_CAMPAIGN_ID} skillId={skill.id} />
    </MemoryRouter>,
  )
}

describe('SkillDetailContent suggested classes', () => {
  beforeEach(() => {
    useClasses.mockReset()
  })

  it('renders the suggested classes section heading', () => {
    mockClassesQuery({ data: [FIGHTER] })

    renderSkillDetail(ATHLETICS)

    expect(screen.getByRole('heading', { name: 'Suggested classes' })).toBeInTheDocument()
  })

  it('links to the catalog class id for a known slug', () => {
    mockClassesQuery({ data: [FIGHTER] })

    renderSkillDetail(ATHLETICS)

    const fighterLink = screen.getByRole('link', { name: 'Fighter' })
    expect(fighterLink).toHaveAttribute(
      'href',
      ROUTES.content.classes.detail(STORY_CAMPAIGN_ID, FIGHTER.id),
    )
  })

  it('renders unknown slugs as text without a link', () => {
    mockClassesQuery({ data: [] })

    const skill = { ...ATHLETICS, suggestedClasses: ['orphan-slug'] }
    renderSkillDetail(skill)

    expect(screen.getByText(formatSlugAsLabel('orphan-slug'))).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: formatSlugAsLabel('orphan-slug') }),
    ).not.toBeInTheDocument()
  })

  it('links homebrew classes by catalog id', () => {
    const homebrewFighter: CharacterClass = {
      ...FIGHTER,
      id: 'abc123',
      slug: 'custom-fighter',
      name: 'My Fighter',
    }
    mockClassesQuery({ data: [homebrewFighter] })

    const skill = { ...ATHLETICS, suggestedClasses: ['custom-fighter'] }
    renderSkillDetail(skill)

    const link = screen.getByRole('link', { name: 'My Fighter' })
    expect(link).toHaveAttribute('href', ROUTES.content.classes.detail(STORY_CAMPAIGN_ID, 'abc123'))
  })

  it('shows a loading state while classes are pending', () => {
    mockClassesQuery({ isPending: true, data: undefined })

    renderSkillDetail(ATHLETICS)

    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Fighter' })).not.toBeInTheDocument()
  })
})
