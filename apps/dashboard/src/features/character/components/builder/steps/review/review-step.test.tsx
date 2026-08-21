import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from '../../../../lib/fixtures/character-builder-fixtures'
import { getBuilderChromeCopy } from '../../../../lib/builder/builder-chrome-copy'
import { ReviewStep } from './review-step.client'
import { lanternGuild } from '../../../connections/organization-picker-drawer.fixtures'

describe('ReviewStep', () => {
  const context = createPopulatedStandaloneBuilderContextFixture()
  const chrome = getBuilderChromeCopy('standalone_pc')

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
        validationHeading={chrome.reviewValidationHeading}
        onNavigateToStep={onNavigateToStep}
      />,
    )

    expect(screen.getByText(chrome.reviewValidationHeading)).toBeInTheDocument()
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
        validationHeading={chrome.reviewValidationHeading}
        onNavigateToStep={vi.fn()}
      />,
    )

    expect(screen.getByText(chrome.reviewReadyMessage)).toBeInTheDocument()
  })

  it('shows selected organization names and domain labels', () => {
    const organizationContext = {
      ...context,
      catalog: { ...context.catalog, organizations: [lanternGuild] },
    }
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      connections: { organizations: [{ organizationId: lanternGuild.id }], locations: [] },
    }

    render(
      <ReviewStep
        context={organizationContext}
        draft={draft}
        preview={null}
        resolvedChoiceSets={[]}
        validationHeading={chrome.reviewValidationHeading}
        onNavigateToStep={vi.fn()}
      />,
    )

    expect(screen.getByText('Lantern Guild — Occupational')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
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
        validationHeading={chrome.reviewValidationHeading}
        onNavigateToStep={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
