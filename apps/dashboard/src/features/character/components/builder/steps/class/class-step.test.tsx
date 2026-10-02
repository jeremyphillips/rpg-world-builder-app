import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { pickClass, pickSkillProficiency } from '@/features/content'
import { pickEquipment } from '@/test/fixtures/pick'

import {
  createStandaloneBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../../lib/fixtures/character-builder-fixtures'
import { ClassStep } from './class-step'

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
      choiceSelections: {},
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

    await user.click(screen.getByRole('button', { name: 'View Fighter details' }))

    const dialog = screen.getByRole('dialog')

    expect(dialog.querySelector('img')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Fighter' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Proficiencies' })).toBeInTheDocument()
    expect(screen.getByText('Choose 2 from 5 options')).toBeInTheDocument()
    expect(onDraftChange).not.toHaveBeenCalled()
  })

  it('omits card media for fallback art while keeping the card stretched in the row', () => {
    const homebrewClass = {
      ...fighter,
      id: 'homebrew-custom-warrior',
      slug: 'custom-warrior',
      source: 'homebrew' as const,
      media: undefined,
      imageKey: undefined,
    }

    const context = createStandaloneBuilderContextFixture({
      catalog: {
        ...populatedBuilderCatalog,
        classes: [fighter, homebrewClass],
        skillProficiencies: [],
        organizations: [],
      },
    })

    const { container } = render(
      <ClassStep
        context={context}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={vi.fn()}
      />,
    )

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)
    for (const radio of radios) {
      let shell: Element | null = radio
      while (shell && !shell.classList.contains('h-full')) {
        shell = shell.parentElement
      }
      expect(shell).not.toBeNull()
    }
    expect(container.querySelectorAll('img')).toHaveLength(1)
  })

  it('omits drawer hero media when the resolved image is a fallback placeholder', async () => {
    const user = userEvent.setup()
    const homebrewClass = {
      ...fighter,
      id: 'homebrew-custom-warrior',
      slug: 'custom-warrior',
      source: 'homebrew' as const,
      media: undefined,
      imageKey: undefined,
    }

    const context = createStandaloneBuilderContextFixture({
      catalog: {
        ...populatedBuilderCatalog,
        classes: [homebrewClass],
        skillProficiencies: [],
        organizations: [],
      },
    })

    render(
      <ClassStep
        context={context}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'View Fighter details' }))

    const dialog = screen.getByRole('dialog')
    expect(dialog).not.toHaveAttribute('data-has-media')
    expect(screen.queryByTestId('sheet-sticky-header-shell')).not.toBeInTheDocument()
    expect(dialog.querySelector('img')).not.toBeInTheDocument()
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

    await user.click(screen.getByRole('button', { name: 'View Fighter details' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Select class' }),
    )

    expect(onDraftChange).toHaveBeenCalledWith({
      class: { classId: fighter.id, level: 1 },
      choiceSelections: {},
    })
    expect(screen.queryByRole('heading', { name: 'Proficiencies' })).not.toBeInTheDocument()
  })

  it('clears another class package state and keeps a manual purchase', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const rope = pickEquipment('rope')
    const context = createStandaloneBuilderContextFixture({
      catalog: {
        ...createContext().catalog,
        equipment: [rope],
      },
    })
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      choiceSelections: {
        'spellcasting:srd-cc-5.2.1:wizard:cantrips': ['srd-cc-5.2.1:fire-bolt'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [
          { equipmentId: rope.id, quantity: 1, sourceMode: 'manual' as const },
          { equipmentId: 'srd-cc-5.2.1:sword', quantity: 1, sourceMode: 'startingGold' as const },
        ],
        editedSincePackageSelection: true,
      },
    }

    render(
      <ClassStep
        context={context}
        draft={draft}
        validationIssues={[]}
        onDraftChange={onDraftChange}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Fighter/i }))
    expect(onDraftChange).toHaveBeenCalledWith({
      class: { classId: fighter.id, level: 1 },
      choiceSelections: {},
      equipment: expect.objectContaining({
        mode: 'package',
        editedSincePackageSelection: false,
        purchases: [{ equipmentId: rope.id, quantity: 1, sourceMode: 'manual' }],
      }),
    })
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
