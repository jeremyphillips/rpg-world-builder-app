import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { createStandaloneBuilderContextFixture } from '../../lib/character-builder-fixtures'
import {
  createEmptyProficienciesStepPreviewFixture,
  createProficienciesStepRogueFixture,
  proficienciesStepStealthSkill,
} from '../../lib/proficiencies-step.fixtures'
import { PROFICIENCIES_STEP_EMPTY_MESSAGE } from '../../lib/proficiencies-step.lib'
import { ProficienciesStep } from './proficiencies-step.client'

const originLanguagesContext = createStandaloneBuilderContextFixture()

describe('ProficienciesStep', () => {
  it('renders the empty-step message when no sections are visible', () => {
    render(
      <ProficienciesStep
        context={originLanguagesContext}
        draft={createEmptyCharacterBuilderDraft()}
        preview={createEmptyProficienciesStepPreviewFixture()}
        resolvedChoiceSets={[]}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />,
    )

    expect(screen.getByText(PROFICIENCIES_STEP_EMPTY_MESSAGE)).toBeInTheDocument()
  })

  it('renders Rogue grant rows and the skill choice counter', () => {
    const { context, draft, preview, resolvedChoiceSets } = createProficienciesStepRogueFixture()

    render(
      <ProficienciesStep
        context={context}
        draft={draft}
        preview={preview}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />,
    )

    expect(screen.getByText('DEX · Dexterity')).toBeInTheDocument()
    expect(screen.getByText('INT · Intelligence')).toBeInTheDocument()
    expect(screen.getByText('Thieves Tools')).toBeInTheDocument()
    expect(screen.getByText('Simple Weapon')).toBeInTheDocument()
    expect(screen.getByText('Martial Weapon')).toBeInTheDocument()
    expect(screen.getByText('Light Armor')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Rogue Skills' })).toBeInTheDocument()
    const skillsChoiceSection = screen
      .getByRole('heading', { name: 'Rogue Skills' })
      .closest('section')!
    expect(within(skillsChoiceSection).getByText('Selected: 0 / 2')).toBeInTheDocument()
  })

  it('persists skill removals in draft.choiceSelections', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const base = createProficienciesStepRogueFixture()
    const skillChoiceSetId = base.resolvedChoiceSets.find(
      (choiceSet) => choiceSet.choiceType === 'skillProficiency',
    )!.id
    const { context, preview, resolvedChoiceSets } = base
    const draft = {
      ...base.draft,
      choiceSelections: {
        [skillChoiceSetId]: [proficienciesStepStealthSkill.id],
      },
    }

    render(
      <ProficienciesStep
        context={context}
        draft={draft}
        preview={preview}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={onDraftChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onDraftChange).toHaveBeenCalledWith({
      choiceSelections: {
        [skillChoiceSetId]: [],
      },
    })
  })

  it('builds preview when none is passed', () => {
    const { context, draft, resolvedChoiceSets } = createProficienciesStepRogueFixture()

    render(
      <ProficienciesStep
        context={context}
        draft={draft}
        preview={null}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Saving Throws' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { context, draft, preview, resolvedChoiceSets } = createProficienciesStepRogueFixture()

    const { container } = render(
      <ProficienciesStep
        context={context}
        draft={draft}
        preview={preview}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
