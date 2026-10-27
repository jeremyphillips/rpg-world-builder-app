import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { skillSlugsFromClassChoices } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { pickSkillProficiency } from '../../../lib/fixtures/pick'
import { ROGUE } from '../../fixtures'
import { buildClassDetailViewModel } from '../../lib/class-display'
import { ClassProficienciesSection } from './class-proficiencies-section'

const vocabulary = {
  resolveToolLabel: (slug: string) => slug,
}

describe('ClassProficienciesSection', () => {
  it('keeps granted and choice rows from sharing a document id', () => {
    const viewModel = buildClassDetailViewModel(ROGUE, vocabulary, { surface: 'content-detail' })
    const section = viewModel.sections.find((entry) => entry.id === 'proficiencies')
    if (!section || section.id !== 'proficiencies') {
      throw new Error('Expected proficiencies section')
    }

    const skillProficiencies = skillSlugsFromClassChoices(ROGUE).map((slug) =>
      pickSkillProficiency(slug),
    )

    const { container } = render(
      <MemoryRouter>
        <ClassProficienciesSection
          section={section}
          campaignId="camp_1"
          skillProficiencies={skillProficiencies}
          skillsPending={false}
          vocabulary={vocabulary}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Granted Proficiencies' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Proficiency Choices' })).toBeInTheDocument()
    expect(document.getElementById('tools')).toBeNull()

    const ids = [...container.querySelectorAll('[id]')].map((element) => element.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
