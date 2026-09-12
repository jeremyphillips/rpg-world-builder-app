import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useWatch } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import { TestFormShell } from '@/test/form-shell'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { SpeciesTraitsTab } from '../species-traits-tab'

vi.mock('@rpg/ui/form', async (importOriginal) => {
  const { stubUiFormItems } = await import('@/test/mocks/ui-form')
  return stubUiFormItems(importOriginal, 'trait-detail')
})

type Trait = {
  id?: string
  kind: 'custom' | 'grant'
  name?: string
  description?: string
  overrideDisplay?: boolean
  grants: never[]
}

function TraitsValuesProbe() {
  const traits = useWatch({ name: 'traits' }) as Trait[] | undefined
  return <pre data-testid="traits-values">{JSON.stringify(traits)}</pre>
}

function TabShell({
  traits = [] as Trait[],
  entitySource,
}: {
  traits?: Trait[]
  entitySource?: ContentFormCtx['entitySource']
}) {
  return (
    <TestFormShell defaultValues={{ traits }}>
      <SpeciesTraitsTab formCtx={{ entitySource }} />
      <TraitsValuesProbe />
    </TestFormShell>
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

async function deleteViaOverflow(user: ReturnType<typeof userEvent.setup>, title: string) {
  await user.click(screen.getByRole('button', { name: new RegExp(`Actions for ${title}`, 'i') }))
  await user.click(screen.getByRole('menuitem', { name: /Delete trait/i }))
}

describe('SpeciesTraitsTab', () => {
  it('shows the empty state when there are no traits', () => {
    render(<TabShell />)
    expect(screen.getByText(/No traits added\./i)).toBeInTheDocument()
    expect(screen.getByText(/Select a trait to edit/i)).toBeInTheDocument()
  })

  it('adds a trait and selects it in the detail panel', async () => {
    const user = userEvent.setup()
    render(<TabShell />)

    await user.click(screen.getByRole('button', { name: /Add trait/i }))

    expect(
      within(screen.getByRole('navigation', { name: 'Traits' })).getByRole('button', {
        name: /Trait 1/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('trait-detail')).toHaveTextContent('traits.0')
    expect(JSON.parse(screen.getByTestId('traits-values').textContent ?? '[]')[0]).toMatchObject({
      kind: 'custom',
    })
  })

  it('renders source meta without a Custom or Grant eyebrow', () => {
    render(<TabShell traits={[darkvision]} />)
    const list = screen.getByRole('navigation', { name: 'Traits' })
    expect(within(list).getByText('Homebrew')).toBeInTheDocument()
    expect(within(list).queryByText(/Custom/)).not.toBeInTheDocument()
    expect(within(list).queryByText(/Grant/)).not.toBeInTheDocument()
    expect(within(list).queryByText(/Derived/)).not.toBeInTheDocument()
  })

  it('keeps a loaded grant trait as grant in form state', () => {
    render(
      <TabShell
        traits={[
          {
            id: 't-grant',
            kind: 'grant',
            overrideDisplay: false,
            grants: [],
          },
        ]}
      />,
    )

    expect(JSON.parse(screen.getByTestId('traits-values').textContent ?? '[]')[0]).toMatchObject({
      kind: 'grant',
    })
  })

  it('selects another trait when its row is clicked', async () => {
    const user = userEvent.setup()
    render(<TabShell traits={[darkvision, feyAncestry]} />)

    await user.click(
      within(screen.getByRole('navigation', { name: 'Traits' })).getByRole('button', {
        name: /Fey Ancestry/i,
      }),
    )
    expect(screen.getByTestId('trait-detail')).toHaveTextContent('traits.1')
  })

  it('confirms deletion through the dialog and removes the row', async () => {
    const user = userEvent.setup()
    render(<TabShell traits={[darkvision]} entitySource="homebrew" />)

    await deleteViaOverflow(user, 'Darkvision')
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Delete trait?')

    await user.click(screen.getByRole('button', { name: /^Delete$/ }))

    await waitFor(() => {
      expect(screen.getByText(/No traits added\./i)).toBeInTheDocument()
    })
  })

  it('locks system traits on a system species (no overflow delete, System meta)', () => {
    render(<TabShell traits={[darkvision]} entitySource="system" />)

    expect(screen.getAllByText(/System/).length).toBeGreaterThan(0)
    expect(
      screen.queryByRole('button', { name: /Actions for Darkvision/i }),
    ).not.toBeInTheDocument()
  })

  it('allows deleting newly added rows even on a system species', async () => {
    const user = userEvent.setup()
    render(<TabShell traits={[darkvision]} entitySource="system" />)

    await user.click(screen.getByRole('button', { name: /Add trait/i }))

    expect(screen.getByRole('button', { name: /Actions for Trait 2/i })).toBeInTheDocument()
  })
})
