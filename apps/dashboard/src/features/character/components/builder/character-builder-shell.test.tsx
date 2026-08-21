import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  characterBuilderValidationMessages,
  createEmptyCharacterBuilderDraft,
  createPersistedCharacterBuilderState,
  formatFieldMessage,
  resolveCharacterBuilderDraftKey,
} from '@rpg/contracts'

import { sessionQueryKey } from '@/features/auth'
import {
  renderWithProviders,
  makeTestQueryClient,
  type RenderWithProvidersOptions,
} from '@/test/render'
import { makeAuthMe, makeSessionUser } from '@/test/fixtures/session'

import {
  createStandaloneBuilderCatalogIndexFixture,
  createStandaloneBuilderContextFixture,
} from '../../lib/fixtures/character-builder-fixtures'
import { abilitiesFormCopy } from '../../lib/steps/abilities-form-labels'
import { resetCharacterBuilderStoreCache } from '../../store/character-builder-store'
import { CharacterBuilderShell } from './character-builder-shell.client'

async function assignStrengthScore(score: number) {
  await userEvent.click(
    screen.getByRole('button', {
      name: new RegExp(`${abilitiesFormCopy.chooseScore} for Strength`, 'i'),
    }),
  )
  await userEvent.click(screen.getByRole('menuitem', { name: String(score) }))
}

function installSessionStorageMock(): void {
  const storage = new Map<string, string>()
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
    removeItem: (key: string) => {
      storage.delete(key)
    },
    clear: () => {
      storage.clear()
    },
  })
}

function renderShell(
  ui: ReactElement,
  options: Omit<RenderWithProvidersOptions, 'queryClient'> & {
    userId?: string
  } = {},
) {
  const queryClient = makeTestQueryClient()
  queryClient.setQueryData(
    sessionQueryKey,
    makeAuthMe(makeSessionUser({ id: options.userId ?? 'u1' })),
  )

  return renderWithProviders(ui, {
    ...options,
    queryClient,
  })
}

describe('CharacterBuilderShell', () => {
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

  beforeEach(() => {
    installSessionStorageMock()
    sessionStorage.clear()
    resetCharacterBuilderStoreCache()
  })

  it('renders the builder chrome and navigates between steps', async () => {
    const context = createStandaloneBuilderContextFixture()
    const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

    renderShell(<CharacterBuilderShell context={context} catalogIndex={catalogIndex} />)

    expect(await screen.findByRole('heading', { name: 'New character' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Identity' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Exit' })).toHaveAttribute('href', '/characters')

    await userEvent.click(screen.getByRole('button', { name: /^Species/ }))
    expect(screen.getByRole('heading', { name: 'Species' })).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations once hydrated', async () => {
    const context = createStandaloneBuilderContextFixture()
    const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

    const { container } = renderShell(
      <CharacterBuilderShell context={context} catalogIndex={catalogIndex} />,
    )

    await screen.findByRole('button', { name: 'Continue' })
    await expectNoAxeViolations(container)
  })

  it('restores identity fields after continuing a persisted draft', async () => {
    const context = createStandaloneBuilderContextFixture()
    const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)
    const draftScope = {
      kind: 'standalone' as const,
      userId: 'u1',
      rulesetId: context.rulesetId,
      characterKind: 'pc' as const,
    }
    const persistedDraft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Verna', narrative: { personalityTraits: ['Steady'] } },
      currentStepId: 'identity' as const,
      touchedStepIds: ['identity' as const],
    }

    sessionStorage.setItem(
      resolveCharacterBuilderDraftKey(draftScope, { mode: context.mode }),
      JSON.stringify({
        state: createPersistedCharacterBuilderState(persistedDraft, draftScope),
        version: 0,
      }),
    )

    renderShell(<CharacterBuilderShell context={context} catalogIndex={catalogIndex} />, {
      userId: 'u1',
    })

    expect(await screen.findByText('Continue your character?')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Continue previous draft' }))

    expect(await screen.findByDisplayValue('Verna')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Steady')).toBeInTheDocument()
  })

  it('shows validation alert and rail error when Continue fails on abilities', async () => {
    const context = createStandaloneBuilderContextFixture()
    const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

    renderShell(<CharacterBuilderShell context={context} catalogIndex={catalogIndex} />)

    await screen.findByRole('heading', { name: 'Identity' })
    const stepRail = screen.getByRole('navigation', { name: 'Character builder steps' })
    await userEvent.click(within(stepRail).getByRole('button', { name: /Abilities/i }))

    await screen.findByRole('heading', { name: 'Abilities', level: 2 })
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Assign a score to every ability.')
    expect(screen.getByRole('alert')).toHaveTextContent(
      formatFieldMessage(characterBuilderValidationMessages.stepIncomplete()),
    )
    expect(screen.getByRole('heading', { name: 'Abilities', level: 2 })).toBeInTheDocument()
    expect(
      within(stepRail).getByRole('button', { name: /Abilities, has blocking validation issues/i }),
    ).toBeInTheDocument()
  })

  it('keeps ability scores when navigating away via the step rail without submitting', async () => {
    const context = createStandaloneBuilderContextFixture()
    const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

    renderShell(<CharacterBuilderShell context={context} catalogIndex={catalogIndex} />)

    await screen.findByRole('heading', { name: 'Identity' })
    const stepRail = screen.getByRole('navigation', { name: 'Character builder steps' })
    await userEvent.click(within(stepRail).getByRole('button', { name: /Abilities/i }))

    await assignStrengthScore(15)

    await userEvent.click(within(stepRail).getByRole('button', { name: /Review/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument()
    })

    await userEvent.click(within(stepRail).getByRole('button', { name: /Abilities/i }))

    await waitFor(() => {
      expect(screen.getByLabelText('Strength score 15')).toBeInTheDocument()
    })
  })

  it('clears the step alert and rail error when a failed step becomes valid', async () => {
    const context = createStandaloneBuilderContextFixture()
    const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

    renderShell(<CharacterBuilderShell context={context} catalogIndex={catalogIndex} />)

    await screen.findByRole('heading', { name: 'Identity' })
    const stepRail = screen.getByRole('navigation', { name: 'Character builder steps' })

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      formatFieldMessage(characterBuilderValidationMessages.nameRequired()),
    )
    expect(
      within(stepRail).getByRole('button', { name: /Identity, has blocking validation issues/i }),
    ).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText(/Character name/i), 'Verna')

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
    expect(
      within(stepRail).queryByRole('button', { name: /Identity, has blocking validation issues/i }),
    ).not.toBeInTheDocument()
  })
})
