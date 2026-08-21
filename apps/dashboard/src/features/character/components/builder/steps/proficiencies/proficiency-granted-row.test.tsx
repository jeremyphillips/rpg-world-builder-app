import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { createProficienciesStepRogueFixture } from '../../../../lib/proficiencies/proficiencies-step.fixtures'
import { ProficiencyGrantedRow } from './proficiency-granted-row.client'

describe('ProficiencyGrantedRow', () => {
  it('renders label and source without a remove action', () => {
    const { model } = createProficienciesStepRogueFixture()
    const row = model.sections.find((section) => section.kind === 'savingThrows')!.grantedRows[0]!

    render(<ProficiencyGrantedRow row={row} />)

    expect(screen.getByText(row.label)).toBeInTheDocument()
    expect(screen.getByText(row.sourceLabel)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { model } = createProficienciesStepRogueFixture()
    const row = model.sections.find((section) => section.kind === 'tools')!.grantedRows[0]!

    const { container } = render(<ProficiencyGrantedRow row={row} />)

    await expectNoAxeViolations(container)
  })
})
