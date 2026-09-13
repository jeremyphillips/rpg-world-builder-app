import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useWatch } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import { draconicHeritageForm } from '@/test/fixtures/factories/additional/heritage'
import { TestFormShell } from '@/test/form-shell'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import type { HeritageForm } from '../../../species/lib/species-heritage-form-fields'
import type * as SpeciesApi from '../../../species/api/species-api'
import { fetchSpeciesHeritageRemovalAvailability } from '../../../species/api/species-api'
import { SpeciesHeritageTab } from '../species-heritage-tab'

vi.mock('@rpg/ui/form', async (importOriginal) => {
  const { stubUiFormItems } = await import('@/test/mocks/ui-form')
  return stubUiFormItems(importOriginal)
})

vi.mock('../../../species/api/species-api', async (importOriginal) => {
  const actual = await importOriginal<typeof SpeciesApi>()
  return {
    ...actual,
    fetchSpeciesHeritageRemovalAvailability: vi.fn(),
  }
})

const mockFetchHeritageRemovalAvailability = vi.mocked(fetchSpeciesHeritageRemovalAvailability)

function HeritageValuesProbe() {
  const heritage = useWatch({ name: 'heritage' }) as HeritageForm | undefined
  return <pre data-testid="heritage-values">{JSON.stringify(heritage)}</pre>
}

function TabShell({
  heritage,
  entitySource,
  campaignId = 'camp-1',
  entityId = 'species-1',
}: {
  heritage?: HeritageForm
  entitySource?: ContentFormCtx['entitySource']
  campaignId?: string
  entityId?: string
}) {
  return (
    <TestFormShell defaultValues={{ heritage }}>
      <SpeciesHeritageTab formCtx={{ entitySource, campaignId, entityId }} />
      <HeritageValuesProbe />
    </TestFormShell>
  )
}

async function deleteOptionViaOverflow(user: ReturnType<typeof userEvent.setup>, title: string) {
  await user.click(screen.getByRole('button', { name: new RegExp(`Actions for ${title}`, 'i') }))
  await user.click(screen.getByRole('menuitem', { name: /Delete heritage option/i }))
}

async function removeHeritageGroupViaOverflow(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /Heritage group actions/i }))
  await user.click(screen.getByRole('menuitem', { name: /Remove heritage group/i }))
}

describe('SpeciesHeritageTab', () => {
  it('shows the empty state when there is no heritage', () => {
    render(<TabShell />)
    expect(screen.getByText(/No heritage group yet/i)).toBeInTheDocument()
    expect(
      screen.getByText(
        /Create a set of heritage choices players can select during character creation/i,
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Set up heritage/i })).toBeInTheDocument()
  })

  it('adds heritage and shows scalar fields plus options master-detail', async () => {
    const user = userEvent.setup()
    render(<TabShell />)

    await user.click(screen.getByRole('button', { name: /Set up heritage/i }))

    await waitFor(() => {
      expect(screen.getByTestId('detail-heritage')).toHaveTextContent('heritage')
    })
    expect(screen.getByTestId('detail-heritage-options-0')).toHaveTextContent('heritage.options.0')
    expect(
      JSON.parse(screen.getByTestId('heritage-values').textContent ?? '{}').options[0],
    ).toMatchObject({ kind: 'custom' })
  })

  it('renders heritage scalar fields and options list when pre-filled', () => {
    render(<TabShell heritage={draconicHeritageForm} />)
    expect(screen.getByTestId('detail-heritage')).toHaveTextContent('heritage')
    expect(screen.getByRole('button', { name: /Add option/i })).toBeInTheDocument()
    expect(
      within(screen.getByRole('navigation', { name: 'Heritage options' })).getByRole('button', {
        name: /Breath Weapon/i,
      }),
    ).toBeInTheDocument()
  })

  it('confirms deletion through the dialog and removes an option row', async () => {
    const user = userEvent.setup()
    render(<TabShell heritage={draconicHeritageForm} entitySource="homebrew" />)

    await deleteOptionViaOverflow(user, 'Breath Weapon')
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Delete heritage option?')

    await user.click(screen.getByRole('button', { name: /^Delete$/ }))

    await waitFor(() => {
      expect(screen.getByText(/No heritage options added\./i)).toBeInTheDocument()
    })
  })

  it('locks system options on a system species', () => {
    render(<TabShell heritage={draconicHeritageForm} entitySource="system" />)

    expect(screen.getAllByText(/System/).length).toBeGreaterThan(0)
    expect(
      screen.queryByRole('button', { name: /Actions for Breath Weapon/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Heritage group actions/i }),
    ).not.toBeInTheDocument()
  })

  it('allows deleting newly added options even on a system species', async () => {
    const user = userEvent.setup()
    render(<TabShell heritage={draconicHeritageForm} entitySource="system" />)

    await user.click(screen.getByRole('button', { name: /Add option/i }))

    expect(
      screen.getByRole('button', { name: /Actions for Unnamed heritage option/i }),
    ).toBeInTheDocument()
  })

  it('allows removing heritage on homebrew species after availability check', async () => {
    const user = userEvent.setup()
    mockFetchHeritageRemovalAvailability.mockResolvedValue({ status: 'allowed' })
    render(<TabShell heritage={draconicHeritageForm} entitySource="homebrew" />)

    await removeHeritageGroupViaOverflow(user)
    expect(mockFetchHeritageRemovalAvailability).toHaveBeenCalledWith('camp-1', 'species-1')
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Remove heritage group?')

    await user.click(screen.getByRole('button', { name: /^Remove$/ }))

    await waitFor(() => {
      expect(screen.getByText(/No heritage group yet/i)).toBeInTheDocument()
    })
  })

  it('shows blocked dialog when characters use heritage options', async () => {
    const user = userEvent.setup()
    mockFetchHeritageRemovalAvailability.mockResolvedValue({
      status: 'blocked',
      blockers: [
        {
          kind: 'usage',
          usage: {
            kind: 'character',
            id: 'npc-1',
            label: 'Heritage NPC',
            characterType: 'npc',
            campaignId: 'camp-1',
          },
        },
      ],
    })
    render(<TabShell heritage={draconicHeritageForm} entitySource="homebrew" />)

    await removeHeritageGroupViaOverflow(user)

    expect(screen.getByRole('dialog')).toHaveTextContent('Cannot delete Draconic Ancestry')
    expect(screen.getByRole('link', { name: 'Heritage NPC' })).toBeInTheDocument()
    expect(screen.getByTestId('detail-heritage')).toBeInTheDocument()
  })

  it('adds and selects an option in the master-detail editor', async () => {
    const user = userEvent.setup()
    render(<TabShell heritage={draconicHeritageForm} />)

    await user.click(screen.getByRole('button', { name: /Add option/i }))

    expect(screen.getByTestId('detail-heritage-options-1')).toHaveTextContent('heritage.options.1')
    expect(
      JSON.parse(screen.getByTestId('heritage-values').textContent ?? '{}').options[1],
    ).toMatchObject({ kind: 'custom' })
  })
})
