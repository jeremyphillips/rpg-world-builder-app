import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { createEmptyCharacterBuilderDraft, resolveAvailableChoices } from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from '../../lib/character-builder-fixtures'
import { ProficienciesStep } from './proficiencies-step.client'

const context = createPopulatedStandaloneBuilderContextFixture()

describe('ProficienciesStep', () => {
  it('renders the origin language ChoiceSet from resolved choices', () => {
    const draft = createEmptyCharacterBuilderDraft()
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)

    render(
      <ProficienciesStep
        draft={draft}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />,
    )

    expect(screen.getByRole('checkbox', { name: 'Common' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Elvish' })).toBeInTheDocument()
  })

  it('persists language selections in draft.choiceSelections', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const draft = createEmptyCharacterBuilderDraft()
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)
    const languageChoiceSet = resolvedChoiceSets.find(
      (choiceSet) => choiceSet.choiceType === 'language',
    )!

    render(
      <ProficienciesStep
        draft={draft}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={onDraftChange}
      />,
    )

    await user.click(screen.getByRole('checkbox', { name: 'Elvish' }))
    expect(onDraftChange).toHaveBeenCalledWith({
      choiceSelections: {
        [languageChoiceSet.id]: ['elvish'],
      },
    })
  })

  it('has no axe accessibility violations', async () => {
    const draft = createEmptyCharacterBuilderDraft()
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)

    const { container } = render(
      <ProficienciesStep
        draft={draft}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
