import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { NpcStartingChoices } from '@rpg/contracts'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../../lib/fixtures/character-builder-fixtures'
import {
  quickNpcAuthoringTabDefaultValues,
  type QuickNpcAuthoringTabFormValues,
} from '../../../lib/quick-npc/quick-npc-form-fields'
import { quickNpcStandaloneCreateContext } from '../../../lib/quick-npc/quick-npc-test-fixtures'
import type { QuickNpcRequirementOptionSets } from '../../../lib/quick-npc/quick-npc-requirement-options.lib'
import { QuickNpcStartingChoices } from '../quick-npc-starting-choices'

const buildContext = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

const mockChoices: NpcStartingChoices = {
  contributions: [
    {
      id: 'species:elf:keen-senses',
      category: 'skill',
      mechanic: 'choice-allowance',
      selectedIds: ['perception'],
      allowance: { min: 1, max: 1 },
      owner: { ownerKind: 'species', ownerLabel: 'Elf', featureLabel: 'Keen Senses' },
      choiceSetId: 'species:elf:keen-senses',
      overridden: false,
    },
  ],
  removedOverrideIds: [],
  draft: {} as NpcStartingChoices['draft'],
  resolvedChoiceSets: [
    {
      id: 'species:elf:keen-senses',
      sourceType: 'species',
      sourceId: 'elf',
      choiceType: 'skillProficiency',
      label: 'Keen Senses',
      min: 1,
      max: 1,
      required: true,
      options: [
        { id: 'insight', label: 'Insight' },
        { id: 'perception', label: 'Perception' },
        { id: 'survival', label: 'Survival' },
      ],
      provenance: {
        ownerKind: 'species',
        ownerLabel: 'Elf',
        featureLabel: 'Keen Senses',
      },
    },
  ],
}

const resolveQuickNpcStartingChoicesMock = vi.hoisted(() => vi.fn(() => mockChoices))

vi.mock('../../../lib/quick-npc/quick-npc-starting-choices.lib', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../../lib/quick-npc/quick-npc-starting-choices.lib')>()
  return {
    ...actual,
    resolveQuickNpcStartingChoices: resolveQuickNpcStartingChoicesMock,
    startingChoicePickerOptions: vi.fn(() => []),
  }
})

const emptyOptionSets: QuickNpcRequirementOptionSets = { weapons: [], spells: [] }

function StartingChoicesHarness() {
  const form = useForm<QuickNpcAuthoringTabFormValues>({
    defaultValues: quickNpcAuthoringTabDefaultValues,
  })

  return (
    <FormProvider {...form}>
      <QuickNpcStartingChoices
        setup={{
          contextKind: 'standalone',
          speciesId: 'srd-cc-5.2.1:elf',
          classId: 'fighter',
          level: 3,
        }}
        buildContext={buildContext}
        createContext={quickNpcStandaloneCreateContext()}
        optionSets={emptyOptionSets}
      />
    </FormProvider>
  )
}

describe('QuickNpcStartingChoices', () => {
  beforeEach(() => {
    resolveQuickNpcStartingChoicesMock.mockClear()
    resolveQuickNpcStartingChoicesMock.mockReturnValue(mockChoices)
  })

  it('shows collapsed category summary and expands on row activate', async () => {
    const user = userEvent.setup()
    render(<StartingChoicesHarness />)

    expect(screen.getByText('Perception')).toBeInTheDocument()
    expect(screen.queryByText('Keen Senses')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /expand skills/i }))

    expect(screen.getByText('Keen Senses')).toBeInTheDocument()
    expect(screen.getByText('Elf species trait')).toBeInTheDocument()
  })

  it('collapses when Done is activated on the open row', async () => {
    const user = userEvent.setup()
    render(<StartingChoicesHarness />)

    await user.click(screen.getByRole('button', { name: /expand skills/i }))
    expect(screen.getByText('Keen Senses')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /done editing skills/i }))
    expect(
      screen.queryByText('Choose from Insight, Perception, and Survival.'),
    ).not.toBeInTheDocument()
  })
})
