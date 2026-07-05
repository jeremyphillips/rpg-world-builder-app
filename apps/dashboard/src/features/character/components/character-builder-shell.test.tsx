import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  createEmptyCharacterBuilderDraft,
  createPersistedCharacterBuilderState,
  getCharacterBuilderStorageKey,
} from '@rpg/contracts'

import { renderWithProviders } from '@/test/render'

import {
  createStandaloneBuilderCatalogIndexFixture,
  createStandaloneBuilderContextFixture,
} from '../lib/character-builder-fixtures'
import { resetCharacterBuilderStoreCache } from '../store/character-builder-store'
import { CharacterBuilderShell } from './character-builder-shell.client'

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

    renderWithProviders(<CharacterBuilderShell context={context} catalogIndex={catalogIndex} />)

    expect(await screen.findByRole('heading', { name: 'New character' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Identity' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Exit' })).toHaveAttribute('href', '/characters')

    await userEvent.click(screen.getByRole('button', { name: /^Species/ }))
    expect(screen.getByRole('heading', { name: 'Species' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations once hydrated', async () => {
    const context = createStandaloneBuilderContextFixture()
    const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

    const { container } = renderWithProviders(
      <CharacterBuilderShell context={context} catalogIndex={catalogIndex} />,
    )

    await screen.findByRole('button', { name: 'Continue' })
    await expectNoAxeViolations(container)
  })

  it('restores identity fields after continuing a persisted draft', async () => {
    const context = createStandaloneBuilderContextFixture()
    const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)
    const persistedDraft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Verna', narrative: { personalityTraits: ['Steady'] } },
      currentStepId: 'identity' as const,
      touchedStepIds: ['identity' as const],
    }

    sessionStorage.setItem(
      getCharacterBuilderStorageKey(context),
      JSON.stringify({
        state: createPersistedCharacterBuilderState(persistedDraft),
        version: 0,
      }),
    )

    renderWithProviders(<CharacterBuilderShell context={context} catalogIndex={catalogIndex} />)

    expect(await screen.findByText('Continue your character?')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Continue previous draft' }))

    expect(await screen.findByDisplayValue('Verna')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Steady')).toBeInTheDocument()
  })

  it('keeps ability scores when navigating away via the step rail without submitting', async () => {
    const context = createStandaloneBuilderContextFixture()
    const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

    renderWithProviders(<CharacterBuilderShell context={context} catalogIndex={catalogIndex} />)

    await screen.findByRole('heading', { name: 'Identity' })
    const stepRail = screen.getByRole('navigation', { name: 'Character builder steps' })
    await userEvent.click(within(stepRail).getByRole('button', { name: /Abilities/i }))

    const strengthSelect = await screen.findByLabelText(/^Strength$/i)
    await userEvent.click(strengthSelect)
    await userEvent.click(screen.getByRole('option', { name: '15' }))

    await userEvent.click(within(stepRail).getByRole('button', { name: /Review/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument()
    })

    await userEvent.click(within(stepRail).getByRole('button', { name: /Abilities/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/^Strength$/i)).toHaveTextContent('15')
    })
  })
})
