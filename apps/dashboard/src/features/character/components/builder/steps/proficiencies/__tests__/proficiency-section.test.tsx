import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  createProficienciesStepRogueFixture,
  proficienciesStepAcrobaticsSkill,
  proficienciesStepStealthSkill,
} from '../../../../../lib/proficiencies/proficiencies-step.fixtures'
import { ProficiencySection } from '../proficiency-section'

describe('ProficiencySection', () => {
  it('renders the interactive skills section with aggregate count and block chrome', () => {
    const { model } = createProficienciesStepRogueFixture()
    const skills = model.sections.find((section) => section.kind === 'skills')!

    render(
      <ProficiencySection
        section={skills}
        onOpenChoiceSet={() => undefined}
        onRemoveChoice={() => undefined}
      />,
    )

    const skillsSection = screen.getByRole('heading', { name: 'Skills' }).closest('section')!

    expect(screen.getByRole('heading', { name: 'Skills' })).toBeInTheDocument()
    expect(within(skillsSection).getAllByText('0 / 2 chosen')).toHaveLength(2)
    expect(within(skillsSection).getByText('Choose 2 skills.')).toBeInTheDocument()
    expect(within(skillsSection).getByText('Rogue Skills')).toBeInTheDocument()
    expect(within(skillsSection).getByText('Rogue class')).toBeInTheDocument()
    expect(within(skillsSection).getByRole('button', { name: 'Add skill' })).toBeInTheDocument()
    expect(within(skillsSection).getByText('No skills chosen yet.')).toBeInTheDocument()
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

  it('shows a success counter when a single skill block is full', () => {
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

    const { container } = render(
      <ProficiencySection
        section={skills}
        onOpenChoiceSet={() => undefined}
        onRemoveChoice={() => undefined}
      />,
    )

    const skillsSection = screen.getByRole('heading', { name: 'Skills' }).closest('section')!

    expect(screen.queryByText('Selection full')).not.toBeInTheDocument()
    expect(within(skillsSection).getAllByText('2 / 2 chosen')[0]).toHaveClass(
      'text-semantic-success',
    )
    expect(container.querySelector('.rounded-full.bg-semantic-success-strong')).toBeInTheDocument()
    expect(within(skillsSection).getByRole('button', { name: 'Manage skills' })).toBeInTheDocument()
  })

  it('shows block-level validation for a single ChoiceSet block', () => {
    const { model } = createProficienciesStepRogueFixture()
    const skills = model.sections.find((section) => section.kind === 'skills')!
    const choiceSetId = skills.choiceBlocks[0]!.choiceSet.id

    render(
      <ProficiencySection
        section={skills}
        validationIssues={[
          {
            code: 'choice_set_unsatisfied',
            message: 'Choose at least 2 options for Rogue Skills.',
            stepId: 'proficiencies',
            choiceSetId,
          },
        ]}
        onOpenChoiceSet={() => undefined}
        onRemoveChoice={() => undefined}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Choose at least 2 options for Rogue Skills.',
    )
  })

  it('shows block-level validation when a category has multiple ChoiceSets', () => {
    const { model } = createProficienciesStepRogueFixture()
    const skills = model.sections.find((section) => section.kind === 'skills')!
    const section = {
      ...skills,
      subhead: 'Choose skills from the options below.',
      aggregateCount: { selected: 0, max: 3, label: '0 / 3 chosen' },
      choiceBlocks: [
        skills.choiceBlocks[0]!,
        {
          ...skills.choiceBlocks[0]!,
          heading: 'Keen Senses',
          sourceLine: 'Elf species trait',
          choiceSet: {
            ...skills.choiceBlocks[0]!.choiceSet,
            id: 'species:srd-cc-5.2.1:elf:keen-senses',
            label: 'Keen Senses',
            max: 1,
          },
          selectedCount: 0,
          max: 1,
          poolDescription: 'Choose from Perception, Investigation, and Survival.',
          addLabel: 'Add skill proficiency',
          isFull: false,
          isOverSelected: false,
        },
      ],
    }

    render(
      <ProficiencySection
        section={section}
        validationIssues={[
          {
            code: 'choice_set_unsatisfied',
            message: 'Choose at least 2 options for Rogue Skills.',
            stepId: 'proficiencies',
            choiceSetId: skills.choiceBlocks[0]!.choiceSet.id,
          },
          {
            code: 'choice_set_unsatisfied',
            message: 'Choose an option for Keen Senses.',
            stepId: 'proficiencies',
            choiceSetId: 'species:srd-cc-5.2.1:elf:keen-senses',
          },
        ]}
        onOpenChoiceSet={() => undefined}
        onRemoveChoice={() => undefined}
      />,
    )

    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(2)
    expect(alerts[0]).toHaveTextContent('Choose at least 2 options for Rogue Skills.')
    expect(alerts[1]).toHaveTextContent('Choose an option for Keen Senses.')
  })

  it('renders choice blocks for multi-set categories', () => {
    const { model } = createProficienciesStepRogueFixture()
    const skills = model.sections.find((section) => section.kind === 'skills')!
    const section = {
      ...skills,
      subhead: 'Choose skills from the options below.',
      aggregateCount: { selected: 0, max: 3, label: '0 / 3 chosen' },
      choiceBlocks: [
        skills.choiceBlocks[0]!,
        {
          ...skills.choiceBlocks[0]!,
          heading: 'Keen Senses',
          sourceLine: 'Elf species trait',
          choiceSet: {
            ...skills.choiceBlocks[0]!.choiceSet,
            id: 'species:srd-cc-5.2.1:elf:keen-senses',
            label: 'Keen Senses',
            max: 1,
          },
          selectedCount: 0,
          max: 1,
          poolDescription: 'Choose from Perception, Investigation, and Survival.',
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
    expect(
      screen.getByText('Choose from Perception, Investigation, and Survival.'),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Add skill' })).toHaveLength(2)
    expect(screen.getAllByText('No skills chosen yet.')).toHaveLength(2)
  })

  it('keeps selected cards inside the matching subsection for multi-set categories', () => {
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
    const section = {
      ...skills,
      subhead: 'Choose skills from the options below.',
      aggregateCount: { selected: 1, max: 3, label: '1 / 3 chosen' },
      selectedRows: skills.selectedRows,
      choiceBlocks: [
        { ...skills.choiceBlocks[0]!, selectedCount: 1 },
        {
          ...skills.choiceBlocks[0]!,
          heading: 'Keen Senses',
          sourceLine: 'Elf species trait',
          choiceSet: {
            ...skills.choiceBlocks[0]!.choiceSet,
            id: 'species:srd-cc-5.2.1:elf:keen-senses',
            label: 'Keen Senses',
            max: 1,
          },
          selectedCount: 0,
          max: 1,
          poolDescription: 'Choose from Perception, Investigation, and Survival.',
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

    const removeStealth = screen.getByRole('button', { name: 'Remove Stealth' })
    const rogueSkillsBlock = removeStealth.closest('[class*="space-y-3"]') as HTMLElement
    const keenSensesBlock = screen
      .getByText('Keen Senses')
      .closest('[class*="space-y-3"]') as HTMLElement

    expect(within(rogueSkillsBlock).getByText('Stealth')).toBeInTheDocument()
    expect(within(keenSensesBlock).queryByText('Stealth')).not.toBeInTheDocument()
    expect(within(keenSensesBlock).getByText('No skills chosen yet.')).toBeInTheDocument()
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
