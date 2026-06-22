import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import type { ContentFormCtx } from '../../lib/content-form-registry'
import { SpeciesHeritageChoicesTab } from './species-heritage-choices-tab.client'

vi.mock('@rpg/ui/form', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    FormItems: ({ namePrefix }: { namePrefix?: string }) => (
      <div data-testid={`detail-${namePrefix?.replace(/\./g, '-')}`}>{namePrefix}</div>
    ),
  }
})

type Option = {
  id?: string
  kind: 'custom' | 'grant'
  name?: string
  description?: string
  overrideDisplay?: boolean
  grants: never[]
}

type HeritageChoice = {
  id?: string
  name: string
  kind: 'lineage' | 'ancestry'
  description?: string
  options: Option[]
}

function TabShell({
  heritageChoices = [] as HeritageChoice[],
  entitySource,
}: {
  heritageChoices?: HeritageChoice[]
  entitySource?: ContentFormCtx['entitySource']
}) {
  const form = useForm({ defaultValues: { heritageChoices } })
  return (
    <FormProvider {...form}>
      <SpeciesHeritageChoicesTab formCtx={{ entitySource }} />
    </FormProvider>
  )
}

const draconicAncestry: HeritageChoice = {
  id: 'hc1',
  name: 'Draconic Ancestry',
  kind: 'lineage',
  description: '',
  options: [{ id: 'o1', kind: 'custom', name: 'Breath Weapon', description: '', grants: [] }],
}

const elvenLineage: HeritageChoice = {
  id: 'hc2',
  name: 'Elven Lineage',
  kind: 'ancestry',
  description: '',
  options: [{ id: 'o2', kind: 'custom', name: 'Darkvision', description: '', grants: [] }],
}

describe('SpeciesHeritageChoicesTab', () => {
  it('shows the empty state when there are no heritage choices', () => {
    render(<TabShell />)
    expect(screen.getByText(/No heritage choices yet/i)).toBeInTheDocument()
    expect(screen.getByText(/Select a heritage choice to edit/i)).toBeInTheDocument()
  })

  it('adds a heritage choice and shows scalar detail plus nested options editor', async () => {
    const user = userEvent.setup()
    render(<TabShell />)

    await user.click(screen.getByRole('button', { name: /Add heritage choice/i }))

    expect(
      screen.getByRole('button', { name: /^(?!Remove|Move).*Heritage choice 1/ }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('detail-heritageChoices-0')).toHaveTextContent('heritageChoices.0')
    expect(screen.getByTestId('detail-heritageChoices-0-options-0')).toHaveTextContent(
      'heritageChoices.0.options.0',
    )
  })

  it('renders a kind eyebrow for each row', () => {
    render(<TabShell heritageChoices={[draconicAncestry]} />)
    expect(screen.getByText('Lineage')).toBeInTheDocument()
  })

  it('renders Ancestry eyebrow for ancestry kind rows', () => {
    render(<TabShell heritageChoices={[elvenLineage]} />)
    expect(screen.getByText('Ancestry')).toBeInTheDocument()
  })

  it('selects another heritage choice when its row is clicked', async () => {
    const user = userEvent.setup()
    render(<TabShell heritageChoices={[draconicAncestry, elvenLineage]} />)

    await user.click(screen.getByRole('button', { name: /^(?!Remove|Move).*Elven Lineage/ }))
    expect(screen.getByTestId('detail-heritageChoices-1')).toHaveTextContent('heritageChoices.1')
  })

  it('confirms deletion through the dialog and removes the outer row', async () => {
    const user = userEvent.setup()
    render(<TabShell heritageChoices={[draconicAncestry]} entitySource="homebrew" />)

    await user.click(screen.getByRole('button', { name: /Remove Draconic Ancestry/i }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Delete heritage choice?')

    await user.click(screen.getByRole('button', { name: /^Delete$/ }))

    await waitFor(() => {
      expect(screen.getByText(/No heritage choices yet/i)).toBeInTheDocument()
    })
  })

  it('locks system heritage choices on a system species', () => {
    render(<TabShell heritageChoices={[draconicAncestry]} entitySource="system" />)

    const heritageList = screen.getByRole('navigation', { name: 'Heritage choices' })
    expect(within(heritageList).getByText('System')).toBeInTheDocument()
    expect(
      within(heritageList).queryByRole('button', { name: /Remove Draconic Ancestry/i }),
    ).not.toBeInTheDocument()
  })

  it('allows deleting newly added heritage choices even on a system species', async () => {
    const user = userEvent.setup()
    render(<TabShell heritageChoices={[draconicAncestry]} entitySource="system" />)

    await user.click(screen.getByRole('button', { name: /Add heritage choice/i }))

    expect(screen.getByRole('button', { name: /Remove Heritage choice 2/i })).toBeInTheDocument()
  })

  it('adds and selects an option in the nested editor', async () => {
    const user = userEvent.setup()
    render(<TabShell heritageChoices={[draconicAncestry]} />)

    await user.click(screen.getByRole('button', { name: /Add option/i }))

    expect(screen.getByTestId('detail-heritageChoices-0-options-1')).toHaveTextContent(
      'heritageChoices.0.options.1',
    )
  })
})
