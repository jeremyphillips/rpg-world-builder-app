import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  createEmptyCharacterBuilderDraft,
  DEFAULT_SYSTEM_RULESET_ID,
  type Species,
} from '@rpg/contracts'
import { listLanguageSeedOptions } from '@rpg/catalog/vocabulary'

import {
  createStandaloneBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
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

function createContext() {
  return createStandaloneBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      species: [dwarfWithTraits],
      languages: [...listLanguageSeedOptions(DEFAULT_SYSTEM_RULESET_ID)],
    },
  })
}

describe('SpeciesStep', () => {
  it('selects a species when the card is clicked', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const context = createContext()

    render(
      <SpeciesStep
        context={context}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={onDraftChange}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Dwarf/i }))
    expect(onDraftChange).toHaveBeenCalledWith({
      species: { speciesId: 'srd-cc-5.2.1:dwarf' },
    })
  })

  it('opens details without changing selection', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const context = createContext()

    render(
      <SpeciesStep
        context={context}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={onDraftChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Details' }))

    expect(screen.getByRole('heading', { name: 'Dwarf' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Traits' })).toBeInTheDocument()
    expect(onDraftChange).not.toHaveBeenCalled()
  })

  it('selects from the sheet and closes it', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const context = createContext()

    render(
      <SpeciesStep
        context={context}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={onDraftChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Details' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Select species' }),
    )

    expect(onDraftChange).toHaveBeenCalledWith({
      species: { speciesId: 'srd-cc-5.2.1:dwarf' },
    })
    expect(screen.queryByRole('heading', { name: 'Traits' })).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <SpeciesStep
        context={createContext()}
        draft={createEmptyCharacterBuilderDraft()}
        validationIssues={[]}
        onDraftChange={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
