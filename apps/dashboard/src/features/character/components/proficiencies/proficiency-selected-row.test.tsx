import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { PROFICIENCY_STALE_REASON } from '@rpg/contracts'

import {
  createProficienciesStepRogueFixture,
  createProficienciesStepRogueWithStaleSkillFixture,
  proficienciesStepStealthSkill,
  PROFICIENCIES_STEP_STALE_SKILL_OPTION_ID,
} from '../../lib/proficiencies-step.fixtures'
import {
  PROFICIENCY_SELECTED_ROW_STALE_BADGE_LABEL,
  ProficiencySelectedRow,
} from './proficiency-selected-row.client'

describe('ProficiencySelectedRow', () => {
  it('renders source and remove action for a selected row', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    const base = createProficienciesStepRogueFixture()
    const skillChoiceSetId = base.resolvedChoiceSets.find(
      (choiceSet) => choiceSet.choiceType === 'skillProficiency',
    )!.id
    const { model } = createProficienciesStepRogueFixture({
      choiceSelections: {
        [skillChoiceSetId]: [proficienciesStepStealthSkill.id],
      },
    })

    const row = model.sections.find((section) => section.kind === 'skills')!.choices[0]!
      .selectedRows[0]!

    render(<ProficiencySelectedRow row={row} onRemove={onRemove} />)

    expect(screen.getByText(row.label)).toBeInTheDocument()
    expect(screen.getByText(row.sourceLabel)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('shows a stale badge when the row is stale', () => {
    const { model } = createProficienciesStepRogueWithStaleSkillFixture()

    const staleRow = model.sections
      .find((section) => section.kind === 'skills')!
      .choices[0]!.selectedRows.find(
        (row) => row.optionId === PROFICIENCIES_STEP_STALE_SKILL_OPTION_ID,
      )!

    render(<ProficiencySelectedRow row={staleRow} onRemove={() => undefined} />)

    expect(screen.getByText(PROFICIENCY_SELECTED_ROW_STALE_BADGE_LABEL)).toBeInTheDocument()
    expect(screen.getByText(PROFICIENCY_SELECTED_ROW_STALE_BADGE_LABEL)).toHaveAttribute(
      'title',
      PROFICIENCY_STALE_REASON,
    )
  })

  it('has no axe accessibility violations', async () => {
    const base = createProficienciesStepRogueFixture()
    const skillChoiceSetId = base.resolvedChoiceSets.find(
      (choiceSet) => choiceSet.choiceType === 'skillProficiency',
    )!.id
    const { model } = createProficienciesStepRogueFixture({
      choiceSelections: {
        [skillChoiceSetId]: [proficienciesStepStealthSkill.id],
      },
    })
    const row = model.sections.find((section) => section.kind === 'skills')!.choices[0]!
      .selectedRows[0]!

    const { container } = render(<ProficiencySelectedRow row={row} onRemove={() => undefined} />)

    await expectNoAxeViolations(container)
  })
})
