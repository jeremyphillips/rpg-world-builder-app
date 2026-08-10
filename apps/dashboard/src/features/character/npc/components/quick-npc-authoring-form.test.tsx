import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import { renderWithProviders } from '@/test/render'

import { QuickNpcAuthoringForm } from './quick-npc-authoring-form.client'

vi.mock('../lib/quick-npc-form-fields', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    resolveQuickNpcRequirementCategories: () => ({
      weapons: [{ value: 'srd-cc-5.2.1:longsword', label: 'Longsword' }],
      spells: [],
    }),
  }
})

const createNpcMock = vi.hoisted(() => vi.fn())

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

const organization = {
  id: 'organization-lantern-guild',
  name: 'Lantern Guild',
  organizationKind: 'professional' as const,
}

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

const setup = {
  speciesId: 'srd-cc-5.2.1:dwarf',
  classId: quickFighter.id,
  level: 1,
}

function renderAuthoringForm(
  overrides: Partial<React.ComponentProps<typeof QuickNpcAuthoringForm>> = {},
) {
  const props = {
    campaignId: 'campaign-test-1',
    buildContext,
    organization,
    setup,
    setupSummary: [
      { fieldLabel: 'Species', valueLabel: 'Dwarf' },
      { fieldLabel: 'Class', valueLabel: 'Fighter' },
      { fieldLabel: 'Level', valueLabel: '1' },
    ],
    onCancel: vi.fn(),
    onChangeSetup: vi.fn(),
    onCreated: vi.fn(),
    ...overrides,
  }

  return { props, ...renderWithProviders(<QuickNpcAuthoringForm {...props} />) }
}

describe('QuickNpcAuthoringForm', () => {
  beforeEach(() => {
    createNpcMock.mockReset()
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

  it('returns to setup when setup values are no longer valid at submit time', async () => {
    const user = userEvent.setup()
    const onChangeSetup = vi.fn()
    renderAuthoringForm({
      onChangeSetup,
      setup: {
        ...setup,
        speciesId: 'srd-cc-5.2.1:not-a-species',
      },
    })

    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Guard Captain')
    await user.click(screen.getByRole('button', { name: 'Create NPC' }))

    await waitFor(() => expect(onChangeSetup).toHaveBeenCalledTimes(1))
    expect(createNpcMock).not.toHaveBeenCalled()
  })
})
