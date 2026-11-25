import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { createEmptyCharacterBuilderDraft, reincarnateSpeciesTableFixture } from '@rpg/contracts'

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

  it('renders authored and generated class features from the details trigger', async () => {
    const user = userEvent.setup()
    const wizard = pickClass('wizard')
    const updatedWizard: typeof wizard = {
      ...wizard,
      features: [
        {
          kind: 'custom',
          id: 'planar-study',
          name: 'Planar Study',
          level: 1,
          description: '<p>Study travel between planes.</p>',
          tables: [reincarnateSpeciesTableFixture],
        },
        {
          kind: 'asi',
          id: 'focused-study',
          name: 'Focused Study',
          level: 1,
          description: '<p>Improve an ability through practice.</p>',
        },
        {
          kind: 'spellcasting',
          id: 'spellcasting',
          name: 'Spellcasting',
          level: 1,
          intro: '<p>Record new spells in your spellbook.</p>',
        },
      ],
    }
    const context = createStandaloneBuilderContextFixture({
      catalog: { ...populatedBuilderCatalog, classes: [updatedWizard] },
    })
    render(
      <ClassStep
        context={context}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'View Wizard details' }))

    const details = within(screen.getByRole('dialog'))
    expect(details.getByText('Study travel between planes.')).toBeVisible()
    expect(details.getByRole('table')).toBeVisible()
    expect(details.getByText('Improve an ability through practice.')).toBeVisible()
    expect(details.getByText('Record new spells in your spellbook.')).toBeVisible()
    expect(screen.getByRole('dialog')).toHaveTextContent(/You know three Wizard cantrips/)
  })

  it('omits card media for fallback art while keeping the card stretched in the row', () => {
    const homebrewClass = {
      ...fighter,
      id: 'homebrew-custom-warrior',
      slug: 'custom-warrior',
      catalogLayer: 'homebrew' as const,
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
      expect(radio.closest('.ui-card')).not.toBeNull()
    }
    expect(container.querySelectorAll('img')).toHaveLength(1)
  })

  it('omits drawer hero media when the resolved image is a fallback placeholder', async () => {
    const user = userEvent.setup()
    const homebrewClass = {
      ...fighter,
      id: 'homebrew-custom-warrior',
      slug: 'custom-warrior',
      catalogLayer: 'homebrew' as const,
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
          {
            equipmentId: 'srd-cc-5.2.1:sword',
            quantity: 1,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
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

  it('keeps an explicit picker-cart purchase when changing class', async () => {
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
      equipment: {
        mode: 'gold' as const,
        purchases: [
          {
            equipmentId: rope.id,
            quantity: 1,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
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
        purchases: [
          {
            equipmentId: rope.id,
            quantity: 1,
            sourceMode: 'startingGold',
            origin: 'picker',
          },
        ],
      }),
    })
  })

  it('does not copy the selected starting package into purchases on class change', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const wizard = pickClass('wizard')
    const context = createStandaloneBuilderContextFixture({
      catalog: { ...createContext().catalog, classes: [fighter, wizard] },
    })
    const packageOption = fighter.characterCreation?.startingEquipment?.options.find(
      (option) => option.items.length > 0,
    )
    expect(packageOption).toBeDefined()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: fighter.id, level: 1 as const },
      choiceSelections: {
        [`class:${fighter.id}:starting-equipment`]: [packageOption!.id],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        editedSincePackageSelection: false,
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

    await user.click(screen.getByRole('radio', { name: /Wizard/i }))
    expect(onDraftChange).toHaveBeenCalledWith(
      expect.objectContaining({
        class: { classId: wizard.id, level: 1 },
        equipment: expect.objectContaining({
          purchases: [],
          classPackage: { state: 'unresolved' },
        }),
      }),
    )
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
