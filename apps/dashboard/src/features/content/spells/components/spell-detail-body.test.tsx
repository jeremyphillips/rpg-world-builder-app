import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type * as UseClassesModule from '../../classes/hooks/use-classes'

vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(() => false),
}))
vi.mock('../../classes/hooks/use-classes', async (importOriginal) => {
  const actual = await importOriginal<typeof UseClassesModule>()
  return { ...actual, useClasses: vi.fn() }
})

import { useClasses } from '../../classes/hooks/use-classes'
import { WIZARD } from '../../classes/fixtures'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { FIRE_BOLT } from '../fixtures'
import { buildSpellDetailViewModel } from '../lib/spell-display'
import { SpellDetailBody } from './spell-detail-body'

const useClassesMock = vi.mocked(useClasses)

function mockClasses(
  overrides: Partial<ReturnType<typeof useClasses>> & {
    data?: Array<typeof WIZARD>
  },
) {
  useClassesMock.mockReturnValue({
    data: overrides.data,
    isPending: false,
    isError: false,
    isLoadingError: false,
    isRefetchError: false,
    isSuccess: true,
    isFetching: false,
    error: null,
    ...overrides,
  } as ReturnType<typeof useClasses>)
}

function renderSpellBody() {
  return render(
    <MemoryRouter>
      <SpellDetailBody
        name={FIRE_BOLT.name}
        imageName={FIRE_BOLT.name}
        viewModel={buildSpellDetailViewModel(FIRE_BOLT)}
        campaignId={STORY_CAMPAIGN_ID}
      />
    </MemoryRouter>,
  )
}

describe('SpellDetailBody classes', () => {
  beforeEach(() => {
    useClassesMock.mockReset()
  })

  it('shows the pending notice instead of class badges', () => {
    mockClasses({ isPending: true, isSuccess: false, data: undefined })

    renderSpellBody()

    expect(screen.getByRole('status')).toHaveTextContent('Loading…')
    expect(screen.queryByRole('link', { name: 'Wizard' })).not.toBeInTheDocument()
    expect(screen.queryByText('Sorcerer')).not.toBeInTheDocument()
  })

  it('shows the classes error instead of formatted slug badges when the catalog never loaded', () => {
    mockClasses({
      data: undefined,
      isPending: false,
      isError: true,
      isLoadingError: true,
      isRefetchError: false,
      isSuccess: false,
    })

    renderSpellBody()

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load classes.')
    expect(screen.queryByRole('link', { name: 'Wizard' })).not.toBeInTheDocument()
    expect(screen.queryByText('Sorcerer')).not.toBeInTheDocument()
  })

  it('keeps linked and static class badges from a retained catalog', () => {
    mockClasses({
      data: [WIZARD],
      isError: true,
      isLoadingError: false,
      isRefetchError: true,
      isSuccess: false,
      isFetching: false,
    })

    renderSpellBody()

    expect(screen.getByRole('link', { name: 'Wizard' })).toBeInTheDocument()
    expect(screen.getByText('Sorcerer')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('does not mount the pending notice while a loaded class list refetches', () => {
    mockClasses({
      data: [WIZARD],
      isPending: false,
      isFetching: true,
      isSuccess: true,
    })

    renderSpellBody()

    expect(screen.getByRole('link', { name: 'Wizard' })).toBeInTheDocument()
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument()
  })
})
