import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { skillSlugsFromClassChoices } from '@rpg/contracts'

import { CLASS_SECTION_LABELS, CLASS_STAT_LABELS } from '@/features/content'

vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(() => false),
}))

import { getContentImageUrl } from '../../../lib/detail/page/content-image-url'
import { pickSkillProficiency } from '../../../lib/fixtures/pick'
import { FIGHTER, SUBCLASSES_FOR_FIGHTER } from '../../fixtures'
import { buildClassDetailViewModel } from '../../lib/class-display'
import { ClassDetailBody } from './class-detail-body'

const vocabulary = {
  resolveToolLabel: (slug: string) => slug,
}

describe('ClassDetailBody', () => {
  it('renders view-model identity without edit or usage chrome', () => {
    const skillProficiencies = skillSlugsFromClassChoices(FIGHTER).map((slug) =>
      pickSkillProficiency(slug),
    )

    render(
      <MemoryRouter>
        <ClassDetailBody
          name={FIGHTER.name}
          imageUrl={getContentImageUrl()}
          imageName={FIGHTER.name}
          viewModel={buildClassDetailViewModel(FIGHTER, vocabulary, { surface: 'content-detail' })}
          subclasses={SUBCLASSES_FOR_FIGHTER}
          subclassingEnabled
          campaignId="camp_1"
          skillProficiencies={skillProficiencies}
          skillsPending={false}
          vocabulary={vocabulary}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: FIGHTER.name })).toBeInTheDocument()
    expect(screen.getByText(CLASS_STAT_LABELS.hitDie)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: CLASS_SECTION_LABELS.proficiencies }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /edit/i })).not.toBeInTheDocument()
  })
})
