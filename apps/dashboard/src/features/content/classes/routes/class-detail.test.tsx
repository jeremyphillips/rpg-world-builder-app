import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { skillSlugsSuggestingClass } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

vi.mock('@/components/layout/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))
vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(() => false),
  useCampaignRules: vi.fn(() => ({
    maxCharacterLevel: 20,
    standardMaxCharacterLevel: 20,
  })),
}))

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { pickSkillProficiency } from '../../lib/fixtures/pick'
import { FIGHTER } from '../fixtures'
import { ClassDetailContent } from './class-detail'

const ATHLETICS = pickSkillProficiency('athletics')
const STEALTH = pickSkillProficiency('stealth')

function renderClassDetail() {
  const skillProficiencies = [ATHLETICS, STEALTH]
  return render(
    <MemoryRouter>
      <ClassDetailContent
        characterClass={FIGHTER}
        campaignId={STORY_CAMPAIGN_ID}
        classId={FIGHTER.id}
        subclasses={[]}
        skillProficiencies={skillProficiencies}
        skillsPending={false}
      />
    </MemoryRouter>,
  )
}

describe('ClassDetailContent suggested proficiencies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the suggested proficiencies section from skill SSOT', () => {
    renderClassDetail()

    expect(screen.getByRole('heading', { name: 'Suggested proficiencies' })).toBeInTheDocument()
    expect(screen.getByText(`Choose ${FIGHTER.proficiencies.skills.choose}`)).toBeInTheDocument()

    const expectedSlugs = skillSlugsSuggestingClass(FIGHTER.slug, [ATHLETICS, STEALTH])
    for (const slug of expectedSlugs) {
      const skill = slug === ATHLETICS.slug ? ATHLETICS : STEALTH
      const link = screen.getByRole('link', { name: skill.name })
      expect(link).toHaveAttribute(
        'href',
        ROUTES.content.skillProficiencies.detail(STORY_CAMPAIGN_ID, skill.id),
      )
    }
  })

  it('shows a loading state while skills are pending', () => {
    render(
      <MemoryRouter>
        <ClassDetailContent
          characterClass={FIGHTER}
          campaignId={STORY_CAMPAIGN_ID}
          classId={FIGHTER.id}
          subclasses={[]}
          skillProficiencies={[]}
          skillsPending
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })
})
