import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { skillSlugsFromClassChoices } from '@rpg/contracts'

import { defaultCampaignRules } from '../../lib/form-options/content-campaign-rules'
import { ROUTES } from '@/app/routes'
import {
  CLASS_PROFICIENCY_GROUP_LABELS,
  CLASS_PROFICIENCY_ROW_LABELS,
  CLASS_SECTION_LABELS,
  CLASS_STAT_LABELS,
} from '@/features/content'

vi.mock('@/components/layout/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))
vi.mock('../../lib/usage/content-usage-references-section.client', () => ({
  ContentUsageReferencesSection: () => null,
}))
vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(() => false),
  useCampaignRules: vi.fn(() => ({
    ...defaultCampaignRules(),
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
  showProgressionTable = true,
}: {
  subclasses?: typeof SUBCLASSES_FOR_FIGHTER
  showProgressionTable?: boolean
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
        showProgressionTable={showProgressionTable}
      />
    </MemoryRouter>,
  )
}

describe('ClassDetailContent proficiencies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders proficiencies headings and stat rows from the view model', () => {
    renderClassDetail()

    expect(
      screen.getByRole('heading', { name: CLASS_SECTION_LABELS.proficiencies }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: CLASS_PROFICIENCY_GROUP_LABELS.granted }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: CLASS_PROFICIENCY_GROUP_LABELS.choices }),
    ).toBeInTheDocument()
    expect(screen.getByText(CLASS_STAT_LABELS.hitDie)).toBeInTheDocument()
    expect(screen.getByText('d10 per level')).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Suggested proficiencies' }),
    ).not.toBeInTheDocument()
  })

  it('renders linked skill names in the proficiency choices row', () => {
    renderClassDetail()

    expect(screen.getByText(CLASS_PROFICIENCY_ROW_LABELS.skills)).toBeInTheDocument()
    expect(screen.getByText('Choose 2 from')).toBeInTheDocument()

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

  it('shows empty Tools and Languages choice rows as None', () => {
    renderClassDetail()

    expect(screen.getByText(CLASS_PROFICIENCY_ROW_LABELS.tools)).toBeInTheDocument()
    expect(screen.getByText(CLASS_PROFICIENCY_ROW_LABELS.languages)).toBeInTheDocument()
    expect(screen.getAllByText('None').length).toBeGreaterThanOrEqual(2)
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

  it('hides the progression table when showProgressionTable is false', () => {
    renderClassDetail({ showProgressionTable: false })

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})

describe('ClassDetailContent features', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders class features from the view model', () => {
    renderClassDetail()

    expect(screen.getByRole('heading', { name: 'Fighter Class Features' })).toBeInTheDocument()
    expect(screen.getByText('Second Wind')).toBeInTheDocument()
  })
})

describe('ClassDetailContent subclassing gate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('hides subclass sections and subclass-choice features when subclassing is disabled', () => {
    vi.mocked(useCampaignRules).mockReturnValue({
      ...defaultCampaignRules(),
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
      ...defaultCampaignRules(),
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
