import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  createProficienciesStepRogueFixture,
  proficienciesStepStealthSkill,
} from '../../../../lib/proficiencies/proficiencies-step.fixtures'
import { ProficiencySection } from './proficiency-section.client'

describe('ProficiencySection', () => {
  it('renders granted rows and nested choice sections', () => {
    const { model } = createProficienciesStepRogueFixture()
    const savingThrows = model.sections.find((section) => section.kind === 'savingThrows')!
    const skills = model.sections.find((section) => section.kind === 'skills')!

    render(
      <>
        <ProficiencySection
          section={savingThrows}
          onOpenChoiceSet={() => undefined}
          onRemoveChoice={() => undefined}
        />
        <ProficiencySection
          section={skills}
          onOpenChoiceSet={() => undefined}
          onRemoveChoice={() => undefined}
        />
      </>,
    )

    expect(screen.getByText('DEX · Dexterity')).toBeInTheDocument()
    expect(screen.getAllByText('Granted by Rogue').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Rogue Skills' })).toBeInTheDocument()
    expect(screen.getByText('Selected: 0 / 2')).toBeInTheDocument()
  })

  it('forwards remove actions from choice sections', async () => {
    const user = userEvent.setup()
    const onRemoveChoice = vi.fn()
    const base = createProficienciesStepRogueFixture()
    const skillChoiceSetId = base.resolvedChoiceSets.find(
      (choiceSet) => choiceSet.choiceType === 'skillProficiency',
    )!.id
    const { model } = createProficienciesStepRogueFixture({
      choiceSelections: {
        [skillChoiceSetId]: [proficienciesStepStealthSkill.id],
      },
    })
    const skills = model.sections.find((section) => section.kind === 'skills')!

    render(
      <ProficiencySection
        section={skills}
        onOpenChoiceSet={() => undefined}
        onRemoveChoice={onRemoveChoice}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Remove Stealth' }))
    expect(onRemoveChoice).toHaveBeenCalledWith(skillChoiceSetId, proficienciesStepStealthSkill.id)
  })

  itAxe('has no axe accessibility violations', async () => {
    const { model } = createProficienciesStepRogueFixture()
    const tools = model.sections.find((section) => section.kind === 'tools')!

    const { container } = render(
      <ProficiencySection
        section={tools}
        onOpenChoiceSet={() => undefined}
        onRemoveChoice={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
