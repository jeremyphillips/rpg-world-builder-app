import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { createStandaloneBuilderContextFixture } from '../../lib/character-builder-fixtures'
import { ReviewStep } from './review-step.client'

describe('ReviewStep', () => {
  const context = createStandaloneBuilderContextFixture()

  it('shows blocking issues, required items, and advisory warnings', async () => {
    const user = userEvent.setup()
    const onNavigateToStep = vi.fn()

    render(
      <ReviewStep
        context={context}
        draft={createEmptyCharacterBuilderDraft()}
        preview={{
          abilityScores: {},
          savingThrows: [],
          skills: [],
          proficiencies: {
            skills: [],
            weapons: [],
            armor: [],
            tools: [],
            languages: [],
          },
          proficiencyBonus: undefined,
          maxHp: undefined,
          ac: undefined,
          spellcasting: null,
          equipmentSummary: [],
          unresolvedChoiceSetIds: ['class:srd-cc-5.2.1:fighter:class-skills'],
          warnings: ['Unarmored Defense is not modeled in AC yet.'],
        }}
        resolvedChoiceSets={[
          {
            id: 'class:srd-cc-5.2.1:fighter:class-skills',
            sourceType: 'class',
            sourceId: 'srd-cc-5.2.1:fighter',
            choiceType: 'skillProficiency',
            label: 'Choose Skills',
            min: 2,
            max: 2,
            options: [{ id: 'srd-cc-5.2.1:athletics', label: 'Athletics' }],
            required: true,
          },
        ]}
        validationIssues={[
          {
            code: 'name_required',
            message: 'Enter a character name.',
            path: 'identity.name',
            stepId: 'identity',
          },
        ]}
        onNavigateToStep={onNavigateToStep}
      />,
    )

    expect(screen.getByText('Fix the following before creating:')).toBeInTheDocument()
    expect(screen.getAllByText('Enter a character name.')).toHaveLength(2)
    expect(screen.getByText('Required items')).toBeInTheDocument()
    expect(screen.getByText('Choose Skills')).toBeInTheDocument()
    expect(screen.getByText('Advisory notes')).toBeInTheDocument()
    expect(screen.getByText('Unarmored Defense is not modeled in AC yet.')).toBeInTheDocument()
    expect(screen.queryByText('Name is not set.')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Go to Proficiencies' }))
    expect(onNavigateToStep).toHaveBeenCalledWith('proficiencies')
  })

  it('shows the ready message when validation passes', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Verna', alignment: 'ng' as const },
      species: { speciesId: 'srd-cc-5.2.1:dwarf' },
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
      abilities: {
        method: 'standard-array' as const,
        scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      },
    }

    render(
      <ReviewStep
        context={context}
        draft={draft}
        preview={null}
        resolvedChoiceSets={[]}
        onNavigateToStep={vi.fn()}
      />,
    )

    expect(screen.getByText('Your character is ready to create.')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <ReviewStep
        context={context}
        draft={createEmptyCharacterBuilderDraft()}
        preview={null}
        resolvedChoiceSets={[]}
        validationIssues={[
          {
            code: 'name_required',
            message: 'Enter a character name.',
            path: 'identity.name',
            stepId: 'identity',
          },
        ]}
        onNavigateToStep={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
