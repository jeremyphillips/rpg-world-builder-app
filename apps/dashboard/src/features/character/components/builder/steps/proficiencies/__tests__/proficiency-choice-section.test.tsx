import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  createProficienciesStepRogueFixture,
  proficienciesStepStealthSkill,
} from '../../../../../lib/proficiencies/proficiencies-step.fixtures'
import { ProficiencyChoiceSection } from '../proficiency-choice-section'

describe('ProficiencyChoiceSection', () => {
  it('renders the selection counter and add trigger', () => {
    const { model } = createProficienciesStepRogueFixture()
    const choice = model.sections.find((section) => section.kind === 'skills')!.choices[0]!

    render(
      <ProficiencyChoiceSection
        choice={choice}
        onOpenDrawer={() => undefined}
        onRemove={() => undefined}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Rogue Skills' })).toBeInTheDocument()
    expect(screen.getByText('Selected: 0 / 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add skill proficiency' })).toBeEnabled()
    expect(screen.getByText('No skills chosen yet.')).toBeInTheDocument()
  })

  it('shows Manage label when the ChoiceSet is full and keeps the drawer trigger enabled', () => {
    const base = createProficienciesStepRogueFixture()
    const skillChoiceSetId = base.resolvedChoiceSets.find(
      (choiceSet) => choiceSet.choiceType === 'skillProficiency',
    )!.id
    const { model } = createProficienciesStepRogueFixture({
      choiceSelections: {
        [skillChoiceSetId]: [proficienciesStepStealthSkill.id, 'srd-cc-5.2.1:acrobatics'],
      },
    })
    const choice = model.sections.find((section) => section.kind === 'skills')!.choices[0]!

    render(
      <ProficiencyChoiceSection
        choice={choice}
        onOpenDrawer={() => undefined}
        onRemove={() => undefined}
      />,
    )

    expect(screen.getByRole('button', { name: 'Manage skill choices' })).toBeEnabled()
    expect(screen.getByText('Selection full')).toBeInTheDocument()
  })

  it('calls onRemove with the option id', async () => {
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
    const choice = model.sections.find((section) => section.kind === 'skills')!.choices[0]!

    render(
      <ProficiencyChoiceSection
        choice={choice}
        onOpenDrawer={() => undefined}
        onRemove={onRemove}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Remove Stealth' }))
    expect(onRemove).toHaveBeenCalledWith(proficienciesStepStealthSkill.id)
  })

  itAxe('has no axe accessibility violations', async () => {
    const { model } = createProficienciesStepRogueFixture()
    const choice = model.sections.find((section) => section.kind === 'skills')!.choices[0]!

    const { container } = render(
      <ProficiencyChoiceSection
        choice={choice}
        onOpenDrawer={() => undefined}
        onRemove={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
