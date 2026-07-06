import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { skillSlugsFromClassChoices } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

vi.mock('@/components/layout/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))
vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(() => false),
  useCampaignRules: vi.fn(() => ({
    maxCharacterLevel: 20,
    standardMaxCharacterLevel: 20,
    allowedCharacterCreatureTypes: ['humanoid'],
    multiclassing: {
      enabled: true,
      requirements: {
        primaryAbilityMinimum: { enabled: true, minimumScore: 13 },
        speciesPolicy: { enabled: false },
        speciesLevelLimits: { enabled: false },
      },
    },
    subclassing: { enabled: true },
  })),
}))

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { pickSkillProficiency } from '../../lib/fixtures/pick'
import { FIGHTER, SUBCLASSES_FOR_FIGHTER } from '../fixtures'
import { ClassDetailContent } from './class-detail'
import { useCampaignRules } from '@/features/campaign'

function renderClassDetail({
  subclasses = [] as typeof SUBCLASSES_FOR_FIGHTER,
}: {
  subclasses?: typeof SUBCLASSES_FOR_FIGHTER
} = {}) {
  const expectedSlugs = skillSlugsFromClassChoices(FIGHTER)
  const skillProficiencies = expectedSlugs.map((slug) => pickSkillProficiency(slug))
  return render(
    <MemoryRouter>
      <ClassDetailContent
        characterClass={FIGHTER}
        campaignId={STORY_CAMPAIGN_ID}
        classId={FIGHTER.id}
        subclasses={subclasses}
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
    const skillChoice = FIGHTER.characterCreation?.proficiencies?.skills?.choices?.[0]
    expect(screen.getByText(`Choose ${skillChoice?.choose}`)).toBeInTheDocument()

    const expectedSlugs = skillSlugsFromClassChoices(FIGHTER)
    for (const slug of expectedSlugs) {
      const skill = pickSkillProficiency(slug)
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

describe('ClassDetailContent subclassing gate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('hides subclass sections and subclass-choice features when subclassing is disabled', () => {
    vi.mocked(useCampaignRules).mockReturnValue({
      maxCharacterLevel: 20,
      standardMaxCharacterLevel: 20,
      allowedCharacterCreatureTypes: ['humanoid'],
      multiclassing: {
        enabled: true,
        requirements: {
          primaryAbilityMinimum: { enabled: true, minimumScore: 13 },
          speciesPolicy: { enabled: false },
          speciesLevelLimits: { enabled: false },
        },
      },
      subclassing: { enabled: false },
    })

    renderClassDetail({ subclasses: SUBCLASSES_FOR_FIGHTER })

    expect(screen.queryByRole('heading', { name: 'Subclasses' })).not.toBeInTheDocument()
    expect(screen.queryByText('Champion')).not.toBeInTheDocument()
    expect(screen.queryByText('Fighter Subclass')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Fighter Class Features' })).toBeInTheDocument()
    expect(screen.getByText('Second Wind')).toBeInTheDocument()
  })

  it('shows subclass sections when subclassing is enabled', () => {
    vi.mocked(useCampaignRules).mockReturnValue({
      maxCharacterLevel: 20,
      standardMaxCharacterLevel: 20,
      allowedCharacterCreatureTypes: ['humanoid'],
      multiclassing: {
        enabled: true,
        requirements: {
          primaryAbilityMinimum: { enabled: true, minimumScore: 13 },
          speciesPolicy: { enabled: false },
          speciesLevelLimits: { enabled: false },
        },
      },
      subclassing: { enabled: true },
    })

    renderClassDetail({ subclasses: SUBCLASSES_FOR_FIGHTER })

    expect(screen.getByRole('heading', { name: 'Subclasses' })).toBeInTheDocument()
    expect(screen.getByText('Champion')).toBeInTheDocument()
    expect(screen.getByText('Fighter Subclass')).toBeInTheDocument()
  })
})
