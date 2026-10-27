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

  it('shows the pending notice instead of skill badges while skills are loading', () => {
    const viewModel = buildClassDetailViewModel(ROGUE, vocabulary, { surface: 'content-detail' })
    const section = viewModel.sections.find((entry) => entry.id === 'proficiencies')
    if (!section || section.id !== 'proficiencies') {
      throw new Error('Expected proficiencies section')
    }

    render(
      <MemoryRouter>
        <ClassProficienciesSection
          section={section}
          campaignId="camp_1"
          skillProficiencies={[]}
          skillsPending
          vocabulary={vocabulary}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Loading…')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows the skill error notice instead of static badges when the catalog never loaded', () => {
    const viewModel = buildClassDetailViewModel(ROGUE, vocabulary, { surface: 'content-detail' })
    const section = viewModel.sections.find((entry) => entry.id === 'proficiencies')
    if (!section || section.id !== 'proficiencies') {
      throw new Error('Expected proficiencies section')
    }
    const missingSlug = skillSlugsFromClassChoices(ROGUE)[0]

    render(
      <MemoryRouter>
        <ClassProficienciesSection
          section={section}
          campaignId="camp_1"
          skillProficiencies={[]}
          skillsPending={false}
          skillsLoadingError
          vocabulary={vocabulary}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load skill proficiencies.')
    if (missingSlug) {
      expect(screen.queryByText(missingSlug)).not.toBeInTheDocument()
    }
  })

  it('keeps links and a static badge from a retained skill snapshot', () => {
    const viewModel = buildClassDetailViewModel(ROGUE, vocabulary, { surface: 'content-detail' })
    const section = viewModel.sections.find((entry) => entry.id === 'proficiencies')
    if (!section || section.id !== 'proficiencies') {
      throw new Error('Expected proficiencies section')
    }

    const slugs = skillSlugsFromClassChoices(ROGUE)
    const missingSlug = slugs[0]
    const retained = slugs.slice(1).map((slug) => pickSkillProficiency(slug))
    if (!missingSlug) throw new Error('Expected a skill slug')

    render(
      <MemoryRouter>
        <ClassProficienciesSection
          section={section}
          campaignId="camp_1"
          skillProficiencies={retained}
          skillsPending={false}
          skillsLoadingError={false}
          vocabulary={vocabulary}
        />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByText(missingSlug)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: retained[0]!.name })).toBeInTheDocument()
  })
})
