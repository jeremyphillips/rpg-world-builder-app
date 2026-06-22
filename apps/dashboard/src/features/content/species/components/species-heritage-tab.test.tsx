import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import type { ContentFormCtx } from '../../lib/content-form-registry'
import { SpeciesHeritageTab } from './species-heritage-tab.client'

vi.mock('@rpg/ui/form', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    FormItems: ({ namePrefix }: { namePrefix?: string }) => (
      <div data-testid={`detail-${namePrefix?.replace(/\./g, '-')}`}>{namePrefix}</div>
    ),
  }
})

type Heritage = {
  id?: string
  name: string
  description?: string
  options: Array<{
    id?: string
    name?: string
    description?: string
    overrideDisplay?: boolean
    grants: never[]
  }>
}

function TabShell({
  heritage,
  entitySource,
}: {
  heritage?: Heritage
  entitySource?: ContentFormCtx['entitySource']
}) {
  const form = useForm({ defaultValues: { heritage } })
  return (
    <FormProvider {...form}>
      <SpeciesHeritageTab formCtx={{ entitySource }} />
    </FormProvider>
  )
}

const draconicHeritage: Heritage = {
  id: 'hc1',
  name: 'Draconic Ancestry',
  description: '',
  options: [{ id: 'o1', name: 'Breath Weapon', description: '', grants: [] }],
}

describe('SpeciesHeritageTab', () => {
  it('shows the empty state when there is no heritage', () => {
    render(<TabShell />)
    expect(screen.getByText(/No heritage yet/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add heritage/i })).toBeInTheDocument()
  })

  it('adds heritage and shows scalar fields plus options master-detail', async () => {
    const user = userEvent.setup()
    render(<TabShell />)

    await user.click(screen.getByRole('button', { name: /Add heritage/i }))

    await waitFor(() => {
      expect(screen.getByTestId('detail-heritage')).toHaveTextContent('heritage')
    })
    expect(screen.getByTestId('detail-heritage-options-0')).toHaveTextContent('heritage.options.0')
  })

  it('renders heritage scalar fields and options list when pre-filled', () => {
    render(<TabShell heritage={draconicHeritage} />)
    expect(screen.getByTestId('detail-heritage')).toHaveTextContent('heritage')
    expect(screen.getByRole('button', { name: /Add option/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^(?!Remove|Move).*Breath Weapon/ }),
    ).toBeInTheDocument()
  })

  it('confirms deletion through the dialog and removes an option row', async () => {
    const user = userEvent.setup()
    render(<TabShell heritage={draconicHeritage} entitySource="homebrew" />)

    await user.click(screen.getByRole('button', { name: /Remove Breath Weapon/i }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Delete option?')

    await user.click(screen.getByRole('button', { name: /^Delete$/ }))

    await waitFor(() => {
      expect(screen.getByText(/No options yet/i)).toBeInTheDocument()
    })
  })

  it('locks system options on a system species', () => {
    render(<TabShell heritage={draconicHeritage} entitySource="system" />)

    expect(screen.getByText('System')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Remove Breath Weapon/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Remove heritage/i })).not.toBeInTheDocument()
  })

  it('allows deleting newly added options even on a system species', async () => {
    const user = userEvent.setup()
    render(<TabShell heritage={draconicHeritage} entitySource="system" />)

    await user.click(screen.getByRole('button', { name: /Add option/i }))

    expect(screen.getByRole('button', { name: /Remove Trait 2/i })).toBeInTheDocument()
  })

  it('allows removing heritage on homebrew species', async () => {
    const user = userEvent.setup()
    render(<TabShell heritage={draconicHeritage} entitySource="homebrew" />)

    await user.click(screen.getByRole('button', { name: /Remove heritage/i }))

    await waitFor(() => {
      expect(screen.getByText(/No heritage yet/i)).toBeInTheDocument()
    })
  })

  it('adds and selects an option in the master-detail editor', async () => {
    const user = userEvent.setup()
    render(<TabShell heritage={draconicHeritage} />)

    await user.click(screen.getByRole('button', { name: /Add option/i }))

    expect(screen.getByTestId('detail-heritage-options-1')).toHaveTextContent('heritage.options.1')
  })
})
