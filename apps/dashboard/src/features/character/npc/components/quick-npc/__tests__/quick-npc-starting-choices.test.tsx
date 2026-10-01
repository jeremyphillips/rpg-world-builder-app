import type { ComponentProps } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { NpcStartingChoices, StartingChoiceContribution } from '@rpg/contracts'

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
const resolveCanonicalStartingChoiceAllowanceMock = vi.hoisted(() =>
  vi.fn(
    (): {
      selectedIds: readonly string[]
      suggestedBy?: Readonly<Record<string, readonly ('template' | 'title' | 'species')[]>>
    } => ({ selectedIds: ['perception'] }),
  ),
)

vi.mock('../../../lib/quick-npc/quick-npc-starting-choices.lib', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../../lib/quick-npc/quick-npc-starting-choices.lib')>()
  return {
    ...actual,
    resolveQuickNpcStartingChoices: resolveQuickNpcStartingChoicesMock,
    resolveCanonicalStartingChoiceAllowance: resolveCanonicalStartingChoiceAllowanceMock,
    startingChoicePickerOptions: vi.fn(() => []),
  }
})

const emptyOptionSets: QuickNpcRequirementOptionSets = { weapons: [], spells: [] }

function StartingChoicesHarness({
  setup,
  defaultValues,
  additionalEquipmentOptions = [],
}: {
  setup?: ComponentProps<typeof QuickNpcStartingChoices>['setup']
  defaultValues?: Partial<QuickNpcAuthoringTabFormValues>
  additionalEquipmentOptions?: ComponentProps<
    typeof QuickNpcStartingChoices
  >['additionalEquipmentOptions']
} = {}) {
  const form = useForm<QuickNpcAuthoringTabFormValues>({
    defaultValues: { ...quickNpcAuthoringTabDefaultValues, ...defaultValues },
  })

  return (
    <FormProvider {...form}>
      <QuickNpcStartingChoices
        setup={
          setup ?? {
            contextKind: 'standalone',
            speciesId: 'srd-cc-5.2.1:elf',
            classId: 'fighter',
            level: 3,
          }
        }
        buildContext={buildContext}
        createContext={quickNpcStandaloneCreateContext()}
        optionSets={emptyOptionSets}
        additionalEquipmentOptions={additionalEquipmentOptions}
      />
    </FormProvider>
  )
}

describe('QuickNpcStartingChoices', () => {
  beforeEach(() => {
    cleanup()
    resolveQuickNpcStartingChoicesMock.mockClear()
    resolveQuickNpcStartingChoicesMock.mockReturnValue(mockChoices)
    resolveCanonicalStartingChoiceAllowanceMock.mockReset()
    resolveCanonicalStartingChoiceAllowanceMock.mockReturnValue({
      selectedIds: ['perception'],
      suggestedBy: undefined,
    })
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

  it('pins row actions to the third subgrid column', () => {
    render(<StartingChoicesHarness />)

    const expandSkills = screen.getByRole('button', { name: /expand skills/i })
    expect(expandSkills.querySelector('.col-start-3')).toBeInTheDocument()
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

  it('shows a Granted subsection only when a fixed grant exists', async () => {
    const user = userEvent.setup()
    const grant: StartingChoiceContribution = {
      id: 'species:elf:keen-senses-grant',
      category: 'skill',
      mechanic: 'fixed-grant',
      selectedIds: ['perception'],
      owner: { ownerKind: 'species', ownerLabel: 'Elf', featureLabel: 'Keen Senses' },
      source: { kind: 'speciesTrait', sourceId: 'elf', grantId: 'keen-senses' },
    }
    resolveQuickNpcStartingChoicesMock.mockReturnValue({
      ...mockChoices,
      contributions: [...mockChoices.contributions, grant],
    })
    render(<StartingChoicesHarness />)
    await user.click(screen.getByRole('button', { name: /expand skills/i }))
    expect(screen.getByText('Granted Skills')).toBeInTheDocument()
    expect(screen.getByText('Items this NPC receives and cannot remove.')).toBeInTheDocument()
  })

  it('puts suggestion copy on the selected item', async () => {
    const user = userEvent.setup()
    resolveCanonicalStartingChoiceAllowanceMock.mockReturnValue({
      selectedIds: ['perception'],
      suggestedBy: { perception: ['template'] },
    })
    render(
      <StartingChoicesHarness
        setup={{
          contextKind: 'standalone',
          npcTemplateId: 'guard',
          speciesId: 'srd-cc-5.2.1:elf',
          classId: 'fighter',
          level: 3,
        }}
      />,
    )
    await user.click(screen.getByRole('button', { name: /expand skills/i }))
    expect(screen.getByText('Suggested by Guard role')).toBeInTheDocument()
  })

  it('marks classless equipment complete and spaces the add control below selected rows', async () => {
    const user = userEvent.setup()
    resolveQuickNpcStartingChoicesMock.mockReturnValue({
      ...mockChoices,
      contributions: [],
      resolvedChoiceSets: [],
    })
    render(
      <StartingChoicesHarness
        setup={{
          contextKind: 'standalone',
          npcTemplateId: 'commoner',
          speciesId: 'srd-cc-5.2.1:human',
          classId: '',
          level: 0,
        }}
        defaultValues={{
          equipmentSelections: [{ equipmentId: 'club', quantity: 1, origin: 'role-default' }],
        }}
        additionalEquipmentOptions={[
          {
            option: { value: 'club', label: 'Club' },
            pickerItem: {} as never,
            row: {} as never,
          },
        ]}
      />,
    )

    expect(
      screen.getByRole('button', { name: /all required choices complete/i }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /expand equipment/i }))
    expect(screen.getByText('Add the items this NPC should start with.')).toBeInTheDocument()
    expect(screen.getAllByText('Club').length).toBeGreaterThan(0)
    expect(screen.getByRole('combobox', { name: 'Add equipment' }).closest('.mt-2')).toBeTruthy()
    expect(screen.queryByText('Granted Equipment')).not.toBeInTheDocument()
  })
})
