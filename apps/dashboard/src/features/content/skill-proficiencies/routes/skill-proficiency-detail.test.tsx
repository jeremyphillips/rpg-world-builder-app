import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ClassListItem } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

vi.mock('@/components/layout/breadcrumb/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))
vi.mock('../../lib/usage/content-usage-references-section.client', () => ({
  ContentUsageReferencesSection: () => null,
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
  overrides: Partial<ReturnType<typeof useClassesFn>> & { data?: ClassListItem[] },
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

describe('SkillDetailContent summary and examples', () => {
  beforeEach(() => {
    useClasses.mockReset()
    mockClassesQuery({ data: [] })
  })

  it('renders the summary lead sentence', () => {
    renderSkillDetail(ATHLETICS)

    expect(
      screen.getByText(
        'Athletics covers physical challenges involving strength, movement, and force.',
      ),
    ).toBeInTheDocument()
  })

  it('renders the examples section with list items', () => {
    renderSkillDetail(ATHLETICS)

    expect(screen.getByRole('heading', { name: 'Examples' })).toBeInTheDocument()
    expect(screen.getByText('Jump farther than normal')).toBeInTheDocument()
    expect(screen.getByText('Stay afloat in rough water')).toBeInTheDocument()
    expect(screen.getByText('Break something')).toBeInTheDocument()
  })
})

describe('SkillDetailContent class skill choices', () => {
  beforeEach(() => {
    useClasses.mockReset()
  })

  it('renders the class skill choices section heading', () => {
    mockClassesQuery({ data: [FIGHTER] })

    renderSkillDetail(ATHLETICS)

    expect(screen.getByRole('heading', { name: 'Class skill choices' })).toBeInTheDocument()
  })

  it('links to the catalog class id for a class offering this skill', () => {
    mockClassesQuery({ data: [FIGHTER] })

    renderSkillDetail(ATHLETICS)

    const fighterLink = screen.getByRole('link', { name: 'Fighter' })
    expect(fighterLink).toHaveAttribute(
      'href',
      ROUTES.content.classes.detail(STORY_CAMPAIGN_ID, FIGHTER.id),
    )
  })

  it('omits the section when no class offers this skill', () => {
    mockClassesQuery({ data: [] })

    renderSkillDetail(ATHLETICS)

    expect(screen.queryByRole('heading', { name: 'Class skill choices' })).not.toBeInTheDocument()
  })

  it('links homebrew classes by catalog id', () => {
    const homebrewFighter: ClassListItem = {
      ...FIGHTER,
      id: 'abc123',
      slug: 'custom-fighter',
      name: 'My Fighter',
      subclasses: [],
    }
    mockClassesQuery({ data: [homebrewFighter] })

    renderSkillDetail(ATHLETICS)

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
