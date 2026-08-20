import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import {
  quickNpcMemberSetupWithNoTitle,
  quickNpcOrganizationMemberCreateContext,
  quickNpcTestOrganization,
} from '../lib/quick-npc-test-fixtures'
import { renderWithProviders } from '@/test/render'

import { FormShellFooterScope, FormShellFooterSlot } from '@rpg/ui/form'

import { QuickNpcAuthoringForm } from './quick-npc-authoring-form.client'

vi.mock('../lib/quick-npc-requirement-options.lib', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    buildQuickNpcRequirementOptionSets: () => ({
      weapons: [
        {
          option: { value: 'srd-cc-5.2.1:longsword', label: 'Longsword' },
          pickerItem: {
            equipment: { id: 'srd-cc-5.2.1:longsword', name: 'Longsword', kind: 'weapon' },
            state: {
              isProficient: true,
              recommendation: { tier: 'neutral', reasons: [], specificity: 'exact' },
            },
          },
          row: {
            name: 'Longsword',
            priceLabel: '15 gp',
            kindLabel: 'Weapon',
            comparisonGroups: [],
          },
        },
      ],
      spells: [],
    }),
  }
})

const createNpcMock = vi.hoisted(() => vi.fn())
const generateQuickNpcNameMock = vi.hoisted(() => vi.fn())

vi.mock('../lib/quick-npc-name-generation', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    generateQuickNpcName: generateQuickNpcNameMock,
  }
})

vi.mock('../hooks/use-create-npc', () => ({
  useCreateNpc: () => ({
    mutateAsync: createNpcMock,
    isPending: false,
    isSuccess: false,
  }),
}))

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

const createContext = quickNpcOrganizationMemberCreateContext(quickNpcTestOrganization)

const quickFighter = {
  ...populatedBuilderCatalog.classes[0]!,
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [{ id: 'class-skills', choose: 1, from: ['athletics'] }],
      },
    },
  },
}

const buildContext = createCampaignNpcBuilderContextFixture({
  catalog: {
    ...populatedBuilderCatalog,
    classes: [quickFighter],
  },
})

const setup = quickNpcMemberSetupWithNoTitle({
  speciesId: 'srd-cc-5.2.1:dwarf',
  classId: quickFighter.id,
  level: 1,
})

function renderAuthoringForm(
  overrides: Partial<React.ComponentProps<typeof QuickNpcAuthoringForm>> = {},
) {
  const props = {
    campaignId: 'campaign-test-1',
    buildContext,
    createContext,
    setup,
    onCancel: vi.fn(),
    onChangeSetup: vi.fn(),
    onSetupSummaryEdit: vi.fn(),
    onCreated: vi.fn(),
    ...overrides,
  }

  return {
    props,
    ...renderWithProviders(
      <FormShellFooterScope>
        <QuickNpcAuthoringForm {...props} />
        <FormShellFooterSlot />
      </FormShellFooterScope>,
    ),
  }
}

describe('QuickNpcAuthoringForm', () => {
  beforeEach(() => {
    createNpcMock.mockReset()
    generateQuickNpcNameMock.mockReset()
    generateQuickNpcNameMock.mockResolvedValue({ ok: true, name: 'Thorin Stonehelm' })
  })

  it('populates the name field when Generate is clicked', async () => {
    const user = userEvent.setup()
    renderAuthoringForm()

    await user.click(screen.getByRole('button', { name: 'Generate' }))

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Thorin Stonehelm')
    })
    expect(generateQuickNpcNameMock).toHaveBeenCalledWith({
      speciesId: setup.speciesId,
      context: buildContext,
    })
  })

  it('shows a Details tab badge when Requirements is active and name is invalid', async () => {
    const user = userEvent.setup()
    renderAuthoringForm()

    await user.click(screen.getByRole('tab', { name: /requirements/i }))
    await user.click(screen.getByRole('button', { name: 'Create NPC' }))

    await waitFor(() => {
      expect(
        screen.getByRole('tab', { name: /Details.*1 field needs attention/i }),
      ).toBeInTheDocument()
    })
  })

  it('shows structured setup summary rows with row-level Change actions', () => {
    renderAuthoringForm()

    expect(screen.getByText('Setup')).toBeInTheDocument()
    expect(screen.getByText('No title')).toBeInTheDocument()
    expect(screen.getByText('Dwarf')).toBeInTheDocument()
    expect(screen.getByText('Level 1 Fighter')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change role' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change species' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change build' })).toBeInTheDocument()
  })

  it('returns to setup when setup values are no longer valid at submit time', async () => {
    const user = userEvent.setup()
    const onChangeSetup = vi.fn()
    renderAuthoringForm({
      onChangeSetup,
      setup: quickNpcMemberSetupWithNoTitle({
        speciesId: 'srd-cc-5.2.1:not-a-species',
        classId: quickFighter.id,
        level: 1,
      }),
    })

    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Guard Captain')
    await user.click(screen.getByRole('button', { name: 'Create NPC' }))

    await waitFor(() => expect(onChangeSetup).toHaveBeenCalledTimes(1))
    expect(createNpcMock).not.toHaveBeenCalled()
  })
})
