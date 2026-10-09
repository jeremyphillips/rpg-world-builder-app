import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { indexCharacterBuildCatalog } from '@rpg/contracts'
import type * as Contracts from '@rpg/contracts'
import type { CharacterBuildAdvisory, CharacterBuildContext } from '@rpg/contracts'

import { sessionQueryKey } from '@/features/auth'
import { makeTestQueryClient, renderWithProviders } from '@/test/render'
import { makeAuthMe, makeSessionUser } from '@/test/fixtures/session'

import {
  createCampaignNpcBuilderContextFixture,
  createStandaloneBuilderContextFixture,
} from '../../../lib/fixtures/character-builder-fixtures'
import type * as ValidateBuilderStep from '../../../lib/builder/validate-builder-step'
import { finalizeBuilderCharacter } from '../../../lib/builder/character-builder-finalize.lib'
import { resetCharacterBuilderStoreCache } from '../../../store/character-builder-store'
import { CharacterBuilderShell } from '../character-builder-shell'

const gate = vi.hoisted(() => ({
  advisories: [] as CharacterBuildAdvisory[],
  finalValid: true,
}))

vi.mock('@rpg/contracts', async (importOriginal) => {
  const actual = await importOriginal<typeof Contracts>()
  return {
    ...actual,
    resolveCharacterBuildAdvisoriesForDraft: () => gate.advisories,
  }
})

vi.mock('../../../lib/builder/validate-builder-step', async (importOriginal) => {
  const actual = await importOriginal<typeof ValidateBuilderStep>()
  return {
    ...actual,
    validateBuilderFinalSubmit: (...args: Parameters<typeof actual.validateBuilderFinalSubmit>) =>
      gate.finalValid
        ? { ok: true as const, issues: [] }
        : actual.validateBuilderFinalSubmit(...args),
  }
})

vi.mock('../../../lib/builder/character-builder-finalize.lib', () => ({
  finalizeBuilderCharacter: vi.fn(),
}))

const finalizeMock = vi.mocked(finalizeBuilderCharacter)

const greatswordAdvisory: CharacterBuildAdvisory = {
  code: 'equipment_not_proficient',
  subject: {
    kind: 'equipment',
    equipmentId: 'srd-cc-5.2.1:greatsword',
    label: 'Greatsword',
    equipmentClass: 'weapon',
  },
}

const plateArmorAdvisory: CharacterBuildAdvisory = {
  code: 'equipment_ability_score_requirement_unmet',
  subject: {
    kind: 'equipment',
    equipmentId: 'srd-cc-5.2.1:plate-armor',
    label: 'Plate Armor',
    unmet: [{ ability: 'str', required: 15, actual: 12 }],
  },
}

function installSessionStorageMock(): void {
  const storage = new Map<string, string>()
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => void storage.set(key, value),
    removeItem: (key: string) => void storage.delete(key),
    clear: () => storage.clear(),
  })
}

async function renderAtReview(context: CharacterBuildContext) {
  const queryClient = makeTestQueryClient()
  queryClient.setQueryData(sessionQueryKey, makeAuthMe(makeSessionUser({ id: 'u1' })))
  renderWithProviders(
    <CharacterBuilderShell
      context={context}
      catalogIndex={indexCharacterBuildCatalog(context.catalog)}
    />,
    { queryClient },
  )
  await userEvent.click(await screen.findByRole('button', { name: /^Review/ }))
}

describe('CharacterBuilderShell create advisory gate', () => {
  beforeAll(() => {
    if (!HTMLElement.prototype.scrollIntoView) HTMLElement.prototype.scrollIntoView = () => {}
  })

  beforeEach(() => {
    installSessionStorageMock()
    resetCharacterBuilderStoreCache()
    gate.advisories = []
    gate.finalValid = true
    finalizeMock.mockReset()
    finalizeMock.mockResolvedValue('/characters/c1')
  })

  it('finalizes directly when there are no advisories', async () => {
    await renderAtReview(createStandaloneBuilderContextFixture())
    await userEvent.click(screen.getByRole('button', { name: 'Create character' }))
    await waitFor(() => expect(finalizeMock).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('blocks on hard validation before any advisory dialog', async () => {
    gate.finalValid = false
    gate.advisories = [greatswordAdvisory]
    await renderAtReview(createStandaloneBuilderContextFixture())
    expect(screen.getByRole('button', { name: 'Create character' })).toBeDisabled()
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(finalizeMock).not.toHaveBeenCalled()
  })

  it('shows advisories on Review and does not finalize on Go back', async () => {
    gate.advisories = [greatswordAdvisory]
    await renderAtReview(createStandaloneBuilderContextFixture())
    expect(screen.getByText('Greatsword — Not proficient with this weapon')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Create character' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Go back' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(finalizeMock).not.toHaveBeenCalled()
  })

  it('finalizes after Create character anyway', async () => {
    gate.advisories = [greatswordAdvisory]
    await renderAtReview(createStandaloneBuilderContextFixture())
    await userEvent.click(screen.getByRole('button', { name: 'Create character' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Create character anyway' }))
    await waitFor(() => expect(finalizeMock).toHaveBeenCalledTimes(1))
  })

  it('gates on an ability-score requirement advisory', async () => {
    gate.advisories = [plateArmorAdvisory]
    await renderAtReview(createStandaloneBuilderContextFixture())
    expect(
      screen.getByText('Plate Armor — Requires STR 15; character has STR 12.'),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Create character' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Create character anyway' }))
    await waitFor(() => expect(finalizeMock).toHaveBeenCalledTimes(1))
  })

  it('uses NPC copy in NPC mode', async () => {
    gate.advisories = [greatswordAdvisory]
    const context = createCampaignNpcBuilderContextFixture()
    await renderAtReview(context)
    const chromeCreate = screen
      .getAllByRole('button')
      .find((button) => /^Create/.test(button.textContent ?? ''))!
    await userEvent.click(chromeCreate)
    expect(await screen.findByRole('button', { name: 'Create NPC anyway' })).toBeInTheDocument()
  })
})
