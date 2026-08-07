import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { pickSkillProficiency } from '../../lib/fixtures/pick'
import { buildSkillProficiencyDetailViewModel } from '../lib/skill-proficiency-display'
import { SkillProficiencyDetailMetadata } from './skill-proficiency-detail-metadata.client'

const stealth = buildSkillProficiencyDetailViewModel(pickSkillProficiency('stealth'))

describe('SkillProficiencyDetailMetadata', () => {
  it('renders governing ability and examples', () => {
    render(<SkillProficiencyDetailMetadata viewModel={stealth} />)

    expect(screen.getByText(/^Governing Ability$/)).toBeInTheDocument()
    expect(screen.getByText('Dexterity')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<SkillProficiencyDetailMetadata viewModel={stealth} />)

    await expectNoAxeViolations(container)
  })
})
