import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

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
  beforeEach(() => {
    installSessionStorageMock()
    sessionStorage.clear()
    resetCharacterBuilderStoreCache()
  })

  it('renders the builder chrome and navigates between steps', async () => {
    const context = createStandaloneBuilderContextFixture()
    const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

    render(
      <MemoryRouter>
        <CharacterBuilderShell context={context} catalogIndex={catalogIndex} />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'New character' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Identity' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Exit' })).toHaveAttribute('href', '/characters')

    await userEvent.click(screen.getByRole('button', { name: /^Species/ }))
    expect(screen.getByRole('heading', { name: 'Species' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations once hydrated', async () => {
    const context = createStandaloneBuilderContextFixture()
    const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

    const { container } = render(
      <MemoryRouter>
        <CharacterBuilderShell context={context} catalogIndex={catalogIndex} />
      </MemoryRouter>,
    )

    await screen.findByRole('button', { name: 'Continue' })
    await expectNoAxeViolations(container)
  })
})
