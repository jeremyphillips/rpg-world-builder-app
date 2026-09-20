import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { BUILDER_STEP_CHOOSE_CLASS_PROMPT_ACTION_LABEL } from '../../../../../lib/builder/builder-step-choose-class-prompt.lib'
import { createStandaloneBuilderContextFixture } from '../../../../../lib/fixtures/character-builder-fixtures'
import {
  PROFICIENCIES_CHOOSE_CLASS_PROMPT_DESCRIPTION,
  PROFICIENCIES_CHOOSE_CLASS_PROMPT_HEADING,
} from '../../../../../lib/proficiencies/proficiencies-step.lib'
import {
  createEmptyProficienciesStepPreviewFixture,
  createProficienciesStepOriginLanguagesFixture,
  createProficienciesStepRogueFixture,
  createProficienciesStepRogueWithStaleSkillFixture,
  proficienciesStepAcrobaticsSkill,
  proficienciesStepStealthSkill,
} from '../../../../../lib/proficiencies/proficiencies-step.fixtures'
import { PROFICIENCY_GRANTED_SUMMARY_HEADING } from '../proficiency-granted-summary'
import { PROFICIENCY_SELECTED_ROW_STALE_BADGE_LABEL } from '../proficiency-selected-row'
import { ProficienciesStep } from '../proficiencies-step'

const emptyContext = createStandaloneBuilderContextFixture()

function renderProficienciesStep(
  props: Omit<ComponentProps<typeof ProficienciesStep>, 'onNavigateToStep'>,
  onNavigateToStep = vi.fn(),
) {
  return {
    onNavigateToStep,
    ...render(<ProficienciesStep {...props} onNavigateToStep={onNavigateToStep} />),
  }
}

describe('ProficienciesStep', () => {
  it('renders the choose-class prompt when no class is selected and no sections are visible', async () => {
    const user = userEvent.setup()
    const { onNavigateToStep } = renderProficienciesStep({
      context: emptyContext,
      draft: createEmptyCharacterBuilderDraft(),
      preview: createEmptyProficienciesStepPreviewFixture(),
      resolvedChoiceSets: [],
      validationIssues: [],
      onDraftChange: () => undefined,
    })

    expect(screen.getByText(PROFICIENCIES_CHOOSE_CLASS_PROMPT_HEADING)).toBeInTheDocument()
    expect(screen.getByText(PROFICIENCIES_CHOOSE_CLASS_PROMPT_DESCRIPTION)).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: BUILDER_STEP_CHOOSE_CLASS_PROMPT_ACTION_LABEL }),
    )

    expect(onNavigateToStep).toHaveBeenCalledWith('class')
  })

  it('renders the granted summary and skills choice section for Rogue', () => {
    const { context, draft, preview, resolvedChoiceSets } = createProficienciesStepRogueFixture()

    render(
      <ProficienciesStep
        context={context}
        draft={draft}
        preview={preview}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={() => undefined}
        onNavigateToStep={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('heading', { name: PROFICIENCY_GRANTED_SUMMARY_HEADING }),
    ).toBeInTheDocument()
    expect(screen.getByText('Dexterity · Intelligence')).toBeInTheDocument()
    expect(screen.getByText('Thieves Tools')).toBeInTheDocument()
    expect(screen.getByText('Simple · Martial')).toBeInTheDocument()
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Skills' })).toBeInTheDocument()
    const skillsSection = screen.getByRole('heading', { name: 'Skills' }).closest('section')!
    expect(within(skillsSection).getByText('0 / 2 chosen')).toBeInTheDocument()
  })

  it('shows inline validation on the skills section when ChoiceSets are unsatisfied', () => {
    const { context, draft, preview, resolvedChoiceSets } = createProficienciesStepRogueFixture()
    const skillChoiceSetId = resolvedChoiceSets.find(
      (choiceSet) => choiceSet.choiceType === 'skillProficiency',
    )!.id

    render(
      <ProficienciesStep
        context={context}
        draft={draft}
        preview={preview}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[
          {
            code: 'choice_set_unsatisfied',
            message: 'Choose at least 2 options for Rogue Skills.',
            stepId: 'proficiencies',
            choiceSetId: skillChoiceSetId,
          },
        ]}
        onDraftChange={() => undefined}
        onNavigateToStep={vi.fn()}
      />,
    )

    const skillsSection = screen.getByRole('heading', { name: 'Skills' }).closest('section')!
    expect(within(skillsSection).getByRole('alert')).toHaveTextContent(
      'Choose at least 2 options for Rogue Skills.',
    )
  })

  it('shows the granted summary and interactive sections', () => {
    const { context, draft, preview, resolvedChoiceSets } = createProficienciesStepRogueFixture()

    render(
      <ProficienciesStep
        context={context}
        draft={draft}
        preview={preview}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={() => undefined}
        onNavigateToStep={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('heading', { name: PROFICIENCY_GRANTED_SUMMARY_HEADING }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Skills' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Tools' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Languages' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Saving Throws' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Weapons' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Armor' })).not.toBeInTheDocument()
  })

  it('renders the origin language choice section without class grants', () => {
    const { context, draft, preview, resolvedChoiceSets } =
      createProficienciesStepOriginLanguagesFixture()

    render(
      <ProficienciesStep
        context={context}
        draft={draft}
        preview={preview}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={() => undefined}
        onNavigateToStep={vi.fn()}
      />,
    )

    expect(screen.getByText(PROFICIENCIES_CHOOSE_CLASS_PROMPT_HEADING)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Languages' })).toBeInTheDocument()
    expect(screen.getByText(/Choose 2 languages from Origin Languages\./)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add language' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: PROFICIENCY_GRANTED_SUMMARY_HEADING }),
    ).toBeInTheDocument()
    expect(screen.getByText('No additional languages chosen yet.')).toBeInTheDocument()
  })

  it('shows a stale badge for invalid skill selections', () => {
    const { context, draft, preview, resolvedChoiceSets } =
      createProficienciesStepRogueWithStaleSkillFixture()

    render(
      <ProficienciesStep
        context={context}
        draft={draft}
        preview={preview}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={() => undefined}
        onNavigateToStep={vi.fn()}
      />,
    )

    expect(screen.getByText(PROFICIENCY_SELECTED_ROW_STALE_BADGE_LABEL)).toBeInTheDocument()
    expect(screen.getByText('Stealth')).toBeInTheDocument()
  })

  it('opens the language picker drawer from the origin languages choice', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const { context, draft, preview, resolvedChoiceSets } =
      createProficienciesStepOriginLanguagesFixture()
    const languageChoiceSetId = resolvedChoiceSets.find(
      (choiceSet) => choiceSet.choiceType === 'language',
    )!.id

    render(
      <ProficienciesStep
        context={context}
        draft={draft}
        preview={preview}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onNavigateToStep={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add language' }))
    expect(screen.getByRole('heading', { name: 'Add language' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Search languages' })).toBeInTheDocument()

    const dialog = screen.getByRole('dialog', { name: 'Add language' })
    const elvishRow = within(dialog)
      .getByText('Elvish')
      .closest('[data-picker-item-key]') as HTMLElement
    await user.click(within(elvishRow).getByRole('button', { name: 'Add' }))
    expect(onDraftChange).toHaveBeenCalledWith({
      choiceSelections: {
        [languageChoiceSetId]: ['elvish'],
      },
    })
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
        onNavigateToStep={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Remove Stealth' }))
    expect(onDraftChange).toHaveBeenCalledWith({
      choiceSelections: {
        [skillChoiceSetId]: [],
      },
    })
  })

  it('opens the picker drawer and persists skill selections', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const { context, draft, preview, resolvedChoiceSets } = createProficienciesStepRogueFixture()
    const skillChoiceSetId = resolvedChoiceSets.find(
      (choiceSet) => choiceSet.choiceType === 'skillProficiency',
    )!.id

    render(
      <ProficienciesStep
        context={context}
        draft={draft}
        preview={preview}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={onDraftChange}
        onNavigateToStep={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add skill proficiency' }))
    expect(screen.getByRole('heading', { name: 'Add skill proficiency' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Search skills' })).toBeInTheDocument()

    const acrobaticsRow = screen
      .getByText('Acrobatics')
      .closest('[data-picker-item-key]') as HTMLElement
    await user.click(within(acrobaticsRow).getByRole('button', { name: 'Add' }))
    expect(onDraftChange).toHaveBeenCalledWith({
      choiceSelections: {
        [skillChoiceSetId]: [proficienciesStepAcrobaticsSkill.id],
      },
    })
  })

  it('shows Manage label when selection is full and keeps the drawer trigger enabled', async () => {
    const user = userEvent.setup()
    const base = createProficienciesStepRogueFixture()
    const skillChoiceSetId = base.resolvedChoiceSets.find(
      (choiceSet) => choiceSet.choiceType === 'skillProficiency',
    )!.id
    const { context, preview, resolvedChoiceSets } = base
    const draft = {
      ...base.draft,
      choiceSelections: {
        [skillChoiceSetId]: [proficienciesStepStealthSkill.id, proficienciesStepAcrobaticsSkill.id],
      },
    }

    render(
      <ProficienciesStep
        context={context}
        draft={draft}
        preview={preview}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={vi.fn()}
        onNavigateToStep={vi.fn()}
      />,
    )

    const manageButton = screen.getByRole('button', { name: 'Manage skill choices' })
    expect(manageButton).toBeEnabled()

    await user.click(manageButton)
    expect(screen.getByRole('heading', { name: 'Manage skill choices' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
    expect(screen.getAllByRole('button', { name: 'Remove' }).length).toBeGreaterThan(0)
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
        onNavigateToStep={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('heading', { name: PROFICIENCY_GRANTED_SUMMARY_HEADING }),
    ).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { context, draft, preview, resolvedChoiceSets } = createProficienciesStepRogueFixture()

    const { container } = render(
      <ProficienciesStep
        context={context}
        draft={draft}
        preview={preview}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={() => undefined}
        onNavigateToStep={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
