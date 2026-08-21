import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  characterBuilderStepReadinessMessages,
  createEmptyCharacterBuilderDraft,
  formatFieldMessage,
} from '@rpg/contracts'

import { createStandaloneBuilderContextFixture } from '../../../lib/fixtures/character-builder-fixtures'
import {
  createEmptyProficienciesStepPreviewFixture,
  createProficienciesStepOriginLanguagesFixture,
  createProficienciesStepRogueFixture,
  createProficienciesStepRogueWithStaleSkillFixture,
  proficienciesStepAcrobaticsSkill,
  proficienciesStepStealthSkill,
} from '../../../lib/proficiencies/proficiencies-step.fixtures'
import { PROFICIENCY_SELECTED_ROW_STALE_BADGE_LABEL } from '../../proficiencies/proficiency-selected-row.client'
import { ProficienciesStep } from './proficiencies-step.client'

const emptyContext = createStandaloneBuilderContextFixture()

const proficienciesBlockedNoClassMessage = formatFieldMessage(
  characterBuilderStepReadinessMessages.proficienciesBlockedNoClass(),
)
const proficienciesBlockedHelperMessage = formatFieldMessage(
  characterBuilderStepReadinessMessages.proficienciesBlockedNoClassHelper(),
)

describe('ProficienciesStep', () => {
  it('renders blocked copy when no class is selected and no sections are visible', () => {
    render(
      <ProficienciesStep
        context={emptyContext}
        draft={createEmptyCharacterBuilderDraft()}
        preview={createEmptyProficienciesStepPreviewFixture()}
        resolvedChoiceSets={[]}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />,
    )

    expect(screen.getByText(proficienciesBlockedNoClassMessage)).toBeInTheDocument()
    expect(screen.getByText(proficienciesBlockedHelperMessage)).toBeInTheDocument()
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

  it('shows only sections with grants or choices', () => {
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

    expect(screen.getByRole('heading', { name: 'Saving Throws' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Skills' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tools' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Languages' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Weapons' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Armor' })).toBeInTheDocument()
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
      />,
    )

    expect(screen.getByText(proficienciesBlockedNoClassMessage)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Languages' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Origin Languages' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add language' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Saving Throws' })).not.toBeInTheDocument()
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
      />,
    )

    expect(screen.getByRole('heading', { name: 'Saving Throws' })).toBeInTheDocument()
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
      />,
    )

    await expectNoAxeViolations(container)
  })
})
