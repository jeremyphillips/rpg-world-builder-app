import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  createProficienciesStepRogueFixture,
  proficienciesStepAcrobaticsSkill,
  proficienciesStepStealthSkill,
} from '../../../../../lib/proficiencies/proficiencies-step.fixtures'
import { ProficiencySection } from '../proficiency-section'

describe('ProficiencySection', () => {
  it('renders the interactive skills section with aggregate count and add action', () => {
    const { model } = createProficienciesStepRogueFixture()
    const skills = model.sections.find((section) => section.kind === 'skills')!

    render(
      <ProficiencySection
        section={skills}
        onOpenChoiceSet={() => undefined}
        onRemoveChoice={() => undefined}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Skills' })).toBeInTheDocument()
    expect(screen.getByText('0 / 2 chosen')).toBeInTheDocument()
    expect(screen.getByText('Choose 2 skills from Rogue Skills.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add skill proficiency' })).toBeInTheDocument()
    expect(screen.getByText('No skills chosen yet.')).toBeInTheDocument()
  })

  it('forwards remove actions from selected rows', async () => {
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

  it('shows selection full copy when a single skill block is full', () => {
    const base = createProficienciesStepRogueFixture()
    const skillChoiceSetId = base.resolvedChoiceSets.find(
      (choiceSet) => choiceSet.choiceType === 'skillProficiency',
    )!.id
    const { model } = createProficienciesStepRogueFixture({
      choiceSelections: {
        [skillChoiceSetId]: [proficienciesStepStealthSkill.id, proficienciesStepAcrobaticsSkill.id],
      },
    })
    const skills = model.sections.find((section) => section.kind === 'skills')!

    render(
      <ProficiencySection
        section={skills}
        onOpenChoiceSet={() => undefined}
        onRemoveChoice={() => undefined}
      />,
    )

    expect(screen.getByText('Selection full')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Manage skill choices' })).toBeInTheDocument()
  })

  it('renders light choice-set blocks for multi-set categories', () => {
    const { model } = createProficienciesStepRogueFixture()
    const skills = model.sections.find((section) => section.kind === 'skills')!
    const section = {
      ...skills,
      subhead: 'Choose additional skills from the options below.',
      aggregateCount: { selected: 0, max: 3, label: '0 / 3 chosen' },
      choiceBlocks: [
        skills.choiceBlocks[0]!,
        {
          ...skills.choiceBlocks[0]!,
          choiceSet: {
            ...skills.choiceBlocks[0]!.choiceSet,
            id: 'species:srd-cc-5.2.1:elf:keen-senses',
            label: 'Keen Senses',
            max: 1,
          },
          selectedCount: 0,
          max: 1,
          poolDescription: 'Choose from Perception, Investigation, Survival.',
          addLabel: 'Add skill proficiency',
          isFull: false,
          isOverSelected: false,
        },
      ],
    }

    render(
      <ProficiencySection
        section={section}
        onOpenChoiceSet={() => undefined}
        onRemoveChoice={() => undefined}
      />,
    )

    expect(screen.getByText('Rogue Skills')).toBeInTheDocument()
    expect(screen.getByText('Keen Senses')).toBeInTheDocument()
    expect(screen.getByText('Choose from Perception, Investigation, Survival.')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Add skill proficiency' })).toHaveLength(2)
  })

  itAxe('has no axe accessibility violations', async () => {
    const { model } = createProficienciesStepRogueFixture()
    const skills = model.sections.find((section) => section.kind === 'skills')!

    const { container } = render(
      <ProficiencySection
        section={skills}
        onOpenChoiceSet={() => undefined}
        onRemoveChoice={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
