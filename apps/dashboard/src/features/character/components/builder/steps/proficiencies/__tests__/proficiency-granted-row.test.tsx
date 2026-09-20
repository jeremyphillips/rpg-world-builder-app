import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { createProficienciesStepRogueFixture } from '../../../../../lib/proficiencies/proficiencies-step.fixtures'
import { ProficiencyGrantedRow } from '../proficiency-granted-row'

describe('ProficiencyGrantedRow', () => {
  it('renders label and source without a remove action', () => {
    const { model } = createProficienciesStepRogueFixture()
    const savingThrows = model.fixedGrants.find((row) => row.kind === 'savingThrows')!
    const sourceGroup = savingThrows.sourceGroups[0]!
    const row = {
      id: `saving-throw:${sourceGroup.valueLabels[0]}`,
      kind: savingThrows.kind,
      label: sourceGroup.valueLabels[0]!,
      sourceLabel: sourceGroup.sourceLabel,
    }

    render(<ProficiencyGrantedRow row={row} />)

    expect(screen.getByText(row.label)).toBeInTheDocument()
    expect(screen.getByText(row.sourceLabel)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { model } = createProficienciesStepRogueFixture()
    const tools = model.fixedGrants.find((row) => row.kind === 'tools')!
    const sourceGroup = tools.sourceGroups[0]!
    const row = {
      id: `tool:${sourceGroup.valueLabels[0]}`,
      kind: tools.kind,
      label: sourceGroup.valueLabels[0]!,
      sourceLabel: sourceGroup.sourceLabel,
    }

    const { container } = render(<ProficiencyGrantedRow row={row} />)

    await expectNoAxeViolations(container)
  })
})
