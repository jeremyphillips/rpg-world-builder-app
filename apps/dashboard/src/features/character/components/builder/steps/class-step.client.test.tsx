import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { pickClass, pickSkillProficiency } from '@/features/content'

import {
  createStandaloneBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../lib/fixtures/character-builder-fixtures'
import { ClassStep } from './class-step.client'

const fighter = pickClass('fighter')

function createContext() {
  const skillSlugs = fighter.characterCreation?.proficiencies?.skills?.choices?.[0]?.from ?? []

  return createStandaloneBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      classes: [fighter],
      skillProficiencies: skillSlugs.map((slug) => pickSkillProficiency(slug)),
      organizations: [],
    },
  })
}

describe('ClassStep', () => {
  it('selects a class when the card is clicked', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const context = createContext()

    render(
      <ClassStep
        context={context}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={onDraftChange}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Fighter/i }))
    expect(onDraftChange).toHaveBeenCalledWith({
      class: { classId: fighter.id, level: 1 },
    })
  })

  it('opens details without changing selection', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const context = createContext()

    render(
      <ClassStep
        context={context}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={onDraftChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Details' }))

    expect(screen.getByRole('heading', { name: 'Fighter' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Proficiencies' })).toBeInTheDocument()
    expect(screen.getByText('Choose 2 from 5 options')).toBeInTheDocument()
    expect(onDraftChange).not.toHaveBeenCalled()
  })

  it('selects from the sheet and closes it', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const context = createContext()

    render(
      <ClassStep
        context={context}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={onDraftChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Details' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Select class' }),
    )

    expect(onDraftChange).toHaveBeenCalledWith({
      class: { classId: fighter.id, level: 1 },
    })
    expect(screen.queryByRole('heading', { name: 'Proficiencies' })).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <ClassStep
        context={createContext()}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
