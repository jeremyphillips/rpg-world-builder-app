import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { SpeciesTraitsTab } from './species-traits-tab.client'

vi.mock('@rpg/ui/form', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    FormItems: ({ namePrefix }: { namePrefix?: string }) => (
      <div data-testid="trait-detail">{namePrefix}</div>
    ),
  }
})

type Trait = {
  id?: string
  kind: 'custom' | 'grant'
  name?: string
  description?: string
  overrideDisplay?: boolean
  grants: never[]
}

function TabShell({
  traits = [] as Trait[],
  entitySource,
}: {
  traits?: Trait[]
  entitySource?: ContentFormCtx['entitySource']
}) {
  const form = useForm({ defaultValues: { traits } })
  return (
    <FormProvider {...form}>
      <SpeciesTraitsTab formCtx={{ entitySource }} />
    </FormProvider>
  )
}

const darkvision: Trait = {
  id: 't1',
  kind: 'custom',
  name: 'Darkvision',
  description: '',
  grants: [],
}
const feyAncestry: Trait = {
  id: 't2',
  kind: 'custom',
  name: 'Fey Ancestry',
  description: '',
  grants: [],
}

describe('SpeciesTraitsTab', () => {
  it('shows the empty state when there are no traits', () => {
    render(<TabShell />)
    expect(screen.getByText(/No traits yet/i)).toBeInTheDocument()
    expect(screen.getByText(/Select a trait to edit/i)).toBeInTheDocument()
  })

  it('adds a trait and selects it in the detail panel', async () => {
    const user = userEvent.setup()
    render(<TabShell />)

    await user.click(screen.getByRole('button', { name: /Add trait/i }))

    expect(screen.getByRole('button', { name: /^(?!Remove|Drag).*Trait 1/ })).toBeInTheDocument()
    expect(screen.getByTestId('trait-detail')).toHaveTextContent('traits.0')
  })

  it('renders a kind eyebrow for each row', () => {
    render(<TabShell traits={[darkvision]} />)
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('selects another trait when its row is clicked', async () => {
    const user = userEvent.setup()
    render(<TabShell traits={[darkvision, feyAncestry]} />)

    await user.click(screen.getByRole('button', { name: /^(?!Remove|Drag).*Fey Ancestry/ }))
    expect(screen.getByTestId('trait-detail')).toHaveTextContent('traits.1')
  })

  it('confirms deletion through the dialog and removes the row', async () => {
    const user = userEvent.setup()
    render(<TabShell traits={[darkvision]} entitySource="homebrew" />)

    await user.click(screen.getByRole('button', { name: /Remove Darkvision/i }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Delete trait?')

    await user.click(screen.getByRole('button', { name: /^Delete$/ }))

    await waitFor(() => {
      expect(screen.getByText(/No traits yet/i)).toBeInTheDocument()
    })
  })

  it('locks system traits on a system species (no remove control, System badge)', () => {
    render(<TabShell traits={[darkvision]} entitySource="system" />)

    expect(screen.getByText('System')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Remove Darkvision/i })).not.toBeInTheDocument()
  })

  it('allows deleting newly added rows even on a system species', async () => {
    const user = userEvent.setup()
    render(<TabShell traits={[darkvision]} entitySource="system" />)

    await user.click(screen.getByRole('button', { name: /Add trait/i }))

    expect(screen.getByRole('button', { name: /Remove Trait 2/i })).toBeInTheDocument()
  })
})
