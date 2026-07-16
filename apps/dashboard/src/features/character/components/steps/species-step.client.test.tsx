import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCallback, useMemo, useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  characterBuilderDependentChoiceMessages,
  createEmptyCharacterBuilderDraft,
  DEFAULT_SYSTEM_RULESET_ID,
  DEPENDENT_CHOICE_KINDS,
  formatFieldMessage,
  resolveAvailableChoices,
  type CharacterBuilderDraft,
  type Species,
} from '@rpg/contracts'
import { listLanguageSeedOptions } from '@rpg/catalog/vocabulary'

import { getDrowHeritageSpellCatalog } from '@/features/content/lib/fixtures/grant-display-fixtures'
import { pickSpecies } from '@/features/content/lib/fixtures/pick'
import {
  createStandaloneBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import { CHANGE_HERITAGE_LABEL } from '../../lib/builder-parent-choice-status.lib'
import { SpeciesStep } from './species-step.client'

const dwarfWithTraits = {
  ...populatedBuilderCatalog.species[0]!,
  traits: [
    {
      kind: 'grant',
      id: 'darkvision',
      grantGroups: [
        {
          grants: [{ kind: 'sense', type: 'darkvision', range: 120 }],
        },
      ],
    },
    {
      kind: 'custom',
      id: 'dwarven-resilience',
      name: 'Dwarven Resilience',
      description: '<p>Poison resistance.</p>',
    },
  ],
} as const satisfies Species

const elf = pickSpecies('elf')

function createDwarfContext() {
  return createStandaloneBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      species: [dwarfWithTraits],
      languages: [...listLanguageSeedOptions(DEFAULT_SYSTEM_RULESET_ID)],
    },
  })
}

function createElfContext() {
  return createStandaloneBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      species: [elf],
      spells: getDrowHeritageSpellCatalog(),
      languages: [...listLanguageSeedOptions(DEFAULT_SYSTEM_RULESET_ID)],
    },
  })
}

function renderSpeciesStep({
  context,
  draft = createEmptyCharacterBuilderDraft(),
  onDraftChange = vi.fn(),
}: {
  context: ReturnType<typeof createDwarfContext>
  draft?: CharacterBuilderDraft
  onDraftChange?: (patch: Partial<CharacterBuilderDraft>) => void
}) {
  const resolvedChoiceSets = resolveAvailableChoices(draft, context)

  return render(
    <SpeciesStep
      context={context}
      draft={draft}
      resolvedChoiceSets={resolvedChoiceSets}
      validationIssues={[]}
      onDraftChange={onDraftChange}
    />,
  )
}

function StatefulSpeciesStep({
  context,
  initialDraft = createEmptyCharacterBuilderDraft(),
  onDraftChangeSpy,
}: {
  context: ReturnType<typeof createElfContext>
  initialDraft?: CharacterBuilderDraft
  onDraftChangeSpy?: (patch: Partial<CharacterBuilderDraft>) => void
}) {
  const [draft, setDraft] = useState(initialDraft)
  const resolvedChoiceSets = useMemo(
    () => resolveAvailableChoices(draft, context),
    [context, draft],
  )

  const onDraftChange = useCallback(
    (patch: Partial<CharacterBuilderDraft>) => {
      onDraftChangeSpy?.(patch)
      setDraft((current) => ({
        ...current,
        ...patch,
        species: { ...current.species, ...patch.species },
        choiceSelections: { ...current.choiceSelections, ...patch.choiceSelections },
      }))
    },
    [onDraftChangeSpy],
  )

  return (
    <SpeciesStep
      context={context}
      draft={draft}
      resolvedChoiceSets={resolvedChoiceSets}
      validationIssues={[]}
      onDraftChange={onDraftChange}
    />
  )
}

function speciesCard(speciesId: string): HTMLElement | null {
  const radio = document.getElementById(`character-builder-species-${speciesId}`)
  return radio?.closest('[class*="rounded-xl"]') ?? null
}

describe('SpeciesStep', () => {
  beforeEach(() => {
    if (!HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = vi.fn()
    }
  })

  it('selects a species when the card is clicked', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const context = createDwarfContext()

    renderSpeciesStep({ context, onDraftChange })

    await user.click(screen.getByRole('radio', { name: /Dwarf/i }))
    expect(onDraftChange).toHaveBeenCalledWith({
      species: {
        speciesId: 'srd-cc-5.2.1:dwarf',
        heritageId: undefined,
      },
      choiceSelections: {},
    })
  })

  it('opens details without changing selection', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const context = createDwarfContext()

    renderSpeciesStep({ context, onDraftChange })

    await user.click(screen.getByRole('button', { name: 'Details' }))

    expect(screen.getByRole('heading', { name: 'Dwarf' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Traits' })).toBeInTheDocument()
    expect(onDraftChange).not.toHaveBeenCalled()
  })

  it('selects from the sheet and closes it', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const context = createDwarfContext()

    renderSpeciesStep({ context, onDraftChange })

    await user.click(screen.getByRole('button', { name: 'Details' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Select species' }),
    )

    expect(onDraftChange).toHaveBeenCalledWith({
      species: {
        speciesId: 'srd-cc-5.2.1:dwarf',
        heritageId: undefined,
      },
      choiceSelections: {},
    })
    expect(screen.queryByRole('heading', { name: 'Traits' })).not.toBeInTheDocument()
  })

  it('shows heritage required on the selected Elf card with inline heritage section', async () => {
    const user = userEvent.setup()
    const context = createElfContext()

    render(<StatefulSpeciesStep context={context} />)

    await user.click(screen.getByRole('radio', { name: /Elf/i }))

    const elfCard = speciesCard(elf.id)
    expect(elfCard).toHaveTextContent(
      formatFieldMessage(
        characterBuilderDependentChoiceMessages.parentChoiceRequired({
          kind: DEPENDENT_CHOICE_KINDS.heritage,
        }),
      ),
    )
    const heritageRegion = within(elfCard as HTMLElement).getByRole('region', {
      name: 'Elven Lineage',
    })
    expect(heritageRegion).toBeInTheDocument()
    expect(
      within(heritageRegion).getByText(
        formatFieldMessage(characterBuilderDependentChoiceMessages.requiredStatus()),
      ),
    ).toBeInTheDocument()
    expect(
      within(heritageRegion).getByText(
        formatFieldMessage(characterBuilderDependentChoiceMessages.helperText()),
      ),
    ).toBeInTheDocument()
  })

  it('calls onDraftChange when Drow heritage is selected', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const context = createElfContext()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: elf.id },
    }

    renderSpeciesStep({ context, draft, onDraftChange })

    await user.click(screen.getByRole('radio', { name: /Drow/i }))

    const heritageChoiceSetId = `species:${elf.id}:heritage`
    expect(onDraftChange).toHaveBeenCalledWith({
      choiceSelections: {
        [heritageChoiceSetId]: ['drow'],
      },
      species: {
        speciesId: elf.id,
        heritageId: 'drow',
      },
    })
  })

  it('shows resolved heritage copy inside the selected Elf card', () => {
    const context = createElfContext()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: elf.id, heritageId: 'drow' },
      choiceSelections: {
        [`species:${elf.id}:heritage`]: ['drow'],
      },
    }

    renderSpeciesStep({ context, draft })

    const elfCard = speciesCard(elf.id)
    expect(elfCard).toHaveTextContent(
      formatFieldMessage(
        characterBuilderDependentChoiceMessages.parentChoiceSelected({
          selectedOptionLabel: 'Drow',
          kind: DEPENDENT_CHOICE_KINDS.heritage,
        }),
      ),
    )
    const heritageRegion = within(elfCard as HTMLElement).getByRole('region', {
      name: 'Elven Lineage',
    })
    expect(
      within(heritageRegion).getByText(
        formatFieldMessage(
          characterBuilderDependentChoiceMessages.optionSelected({ selectedOptionLabel: 'Drow' }),
        ),
      ),
    ).toBeInTheDocument()
    expect(
      within(heritageRegion).queryByText(
        formatFieldMessage(characterBuilderDependentChoiceMessages.helperText()),
      ),
    ).not.toBeInTheDocument()
  })

  it('shows Change heritage in the sheet and focuses the embedded heritage section', async () => {
    const user = userEvent.setup()
    const context = createElfContext()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: elf.id },
    }

    renderSpeciesStep({ context, draft })

    await user.click(screen.getByRole('button', { name: 'Details' }))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('button', { name: CHANGE_HERITAGE_LABEL })).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: CHANGE_HERITAGE_LABEL }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      within(speciesCard(elf.id) as HTMLElement).getByRole('region', { name: 'Elven Lineage' }),
    ).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const context = createElfContext()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: elf.id },
    }
    const { container } = renderSpeciesStep({ context, draft })

    await expectNoAxeViolations(container)
  })
})
