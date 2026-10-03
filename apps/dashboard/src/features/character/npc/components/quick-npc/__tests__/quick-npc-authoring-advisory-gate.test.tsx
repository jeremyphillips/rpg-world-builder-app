import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CharacterBuildAdvisory } from '@rpg/contracts'
import { FormShellFooterScope, FormShellFooterSlot } from '@rpg/ui/form'

import { makeCampaignNpcDetail } from '@/test/fixtures/factories/additional/character'
import { renderWithProviders } from '@/test/render'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../../lib/fixtures/character-builder-fixtures'
import {
  quickNpcStandaloneCreateContext,
  quickNpcStandaloneSetupValues,
} from '../../../lib/quick-npc/quick-npc-test-fixtures'
import type * as AuthoringSubmitLib from '../../../lib/quick-npc/quick-npc-authoring-submit.lib'
import { createNpc } from '../../../api/npc-client'
import type * as NpcClient from '../../../api/npc-client'

import { QuickNpcAuthoringForm } from '../quick-npc-authoring-form'

const injected = vi.hoisted(() => ({ advisories: [] as CharacterBuildAdvisory[] }))

vi.mock('../../../lib/quick-npc/quick-npc-authoring-submit.lib', async (importOriginal) => {
  const actual = await importOriginal<typeof AuthoringSubmitLib>()
  return {
    ...actual,
    prepareQuickNpcAuthoringCreate: (
      ...args: Parameters<typeof actual.prepareQuickNpcAuthoringCreate>
    ) => ({ ...actual.prepareQuickNpcAuthoringCreate(...args), advisories: injected.advisories }),
  }
})

vi.mock('../../../api/npc-client', async (importOriginal) => ({
  ...(await importOriginal<typeof NpcClient>()),
  createNpc: vi.fn(),
}))

const createNpcMock = vi.mocked(createNpc)

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

const greatswordAdvisory: CharacterBuildAdvisory = {
  code: 'equipment_not_proficient',
  subject: {
    kind: 'equipment',
    equipmentId: 'srd-cc-5.2.1:greatsword',
    label: 'Greatsword',
    equipmentClass: 'weapon',
  },
}

const quickFighter = {
  ...populatedBuilderCatalog.classes[0]!,
  characterCreation: {
    proficiencies: {
      skills: { choices: [{ id: 'class-skills', choose: 1, from: ['athletics'] }] },
    },
  },
}

function renderForm() {
  return renderWithProviders(
    <FormShellFooterScope>
      <QuickNpcAuthoringForm
        campaignId="campaign-test-1"
        buildContext={createCampaignNpcBuilderContextFixture({
          catalog: { ...populatedBuilderCatalog, classes: [quickFighter] },
        })}
        createContext={quickNpcStandaloneCreateContext()}
        setup={quickNpcStandaloneSetupValues({
          npcTemplateId: 'guard',
          speciesId: populatedBuilderCatalog.species[0]!.id,
          classId: quickFighter.id,
          level: 1,
        })}
        initialValues={{ generateNarrativeOnCreate: false }}
        onCancel={vi.fn()}
        onChangeSetup={vi.fn()}
        onSetupSummaryEdit={vi.fn()}
        onCreated={vi.fn()}
      />
      <FormShellFooterSlot />
    </FormShellFooterScope>,
  )
}

async function fillAndCreate(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: 'Male' }))
  await user.type(screen.getByRole('textbox', { name: /name/i }), 'Guard Captain')
  await user.click(screen.getByRole('combobox', { name: /alignment/i }))
  await user.click(screen.getByRole('option', { name: /lawful neutral/i }))
  await user.click(screen.getByRole('button', { name: 'Create NPC' }))
}

describe('QuickNpcAuthoringForm advisory gate', () => {
  beforeEach(() => {
    injected.advisories = []
    createNpcMock.mockReset()
    createNpcMock.mockResolvedValue(
      makeCampaignNpcDetail({ character: { id: 'npc-1', name: 'Guard Captain' } }),
    )
  })

  it('creates directly when there are no advisories', async () => {
    const user = userEvent.setup()
    renderForm()
    await fillAndCreate(user)
    await waitFor(() => expect(createNpcMock).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('does not create when the user goes back', async () => {
    injected.advisories = [greatswordAdvisory]
    const user = userEvent.setup()
    renderForm()
    await fillAndCreate(user)
    const dialog = await screen.findByRole('alertdialog')
    expect(dialog.textContent).toContain('Not proficient with this weapon')
    await user.click(screen.getByRole('button', { name: 'Go back' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(createNpcMock).not.toHaveBeenCalled()
  })

  it('creates when the user confirms Create NPC anyway', async () => {
    injected.advisories = [greatswordAdvisory]
    const user = userEvent.setup()
    renderForm()
    await fillAndCreate(user)
    await user.click(await screen.findByRole('button', { name: 'Create NPC anyway' }))
    await waitFor(() => expect(createNpcMock).toHaveBeenCalledTimes(1))
  })
})
