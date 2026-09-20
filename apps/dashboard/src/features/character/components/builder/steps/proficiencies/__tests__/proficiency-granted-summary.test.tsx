import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { createProficienciesStepRogueFixture } from '../../../../../lib/proficiencies/proficiencies-step.fixtures'
import {
  PROFICIENCY_GRANTED_SUMMARY_HEADING,
  ProficiencyGrantedSummary,
} from '../proficiency-granted-summary'

describe('ProficiencyGrantedSummary', () => {
  it('renders category rows grouped by source without repeating icons', () => {
    const { model } = createProficienciesStepRogueFixture()

    render(<ProficiencyGrantedSummary rows={model.fixedGrants} />)

    expect(
      screen.getByRole('heading', { name: PROFICIENCY_GRANTED_SUMMARY_HEADING }),
    ).toBeInTheDocument()
    expect(screen.getByText('Saving Throws')).toBeInTheDocument()
    expect(screen.getByText('Dexterity · Intelligence')).toBeInTheDocument()
    expect(screen.getAllByText('Rogue').length).toBeGreaterThan(0)
    expect(screen.queryByText('Granted by Rogue')).not.toBeInTheDocument()
    expect(screen.getByText('Thieves Tools')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Skills' })).not.toBeInTheDocument()
  })

  it('renders nothing when there are no fixed grants', () => {
    const { container } = render(<ProficiencyGrantedSummary rows={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { model } = createProficienciesStepRogueFixture()

    const { container } = render(<ProficiencyGrantedSummary rows={model.fixedGrants} />)

    await expectNoAxeViolations(container)
  })
})
