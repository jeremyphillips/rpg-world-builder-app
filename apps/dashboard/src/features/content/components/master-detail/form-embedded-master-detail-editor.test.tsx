import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import { masterDetailEmptySelectionLabel } from '../../lib/master-detail/master-detail-constants'
import { FormEmbeddedMasterDetailEditor } from './form-embedded-master-detail-editor.client'

vi.mock('@rpg/ui/form', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    FormItems: ({ namePrefix }: { namePrefix?: string }) => (
      <div data-testid={`detail-${namePrefix?.replace(/\./g, '-')}`}>{namePrefix}</div>
    ),
  }
})

type TraitRow = { id?: string; kind: 'custom' | 'grant'; name?: string; grants: never[] }

function EditorShell({
  traits = [] as TraitRow[],
  entitySource,
  embeddedSeedRowIds,
}: {
  traits?: TraitRow[]
  entitySource?: 'system' | 'homebrew'
  embeddedSeedRowIds?: Record<string, readonly string[]>
}) {
  const form = useForm({ defaultValues: { traits } })
  const itemFields = [{ type: 'text' as const, name: 'name', label: 'Name' }]

  return (
    <FormProvider {...form}>
      <FormEmbeddedMasterDetailEditor
        formCtx={{ entitySource, embeddedSeedRowIds }}
        fieldName="traits"
        itemFields={itemFields}
        itemNoun="trait"
        ariaLabel="Traits"
        addLabel="Add trait"
        emptyListLabel="No traits yet. Add one to get started."
        idPrefix="species-trait"
        mapListItem={({ row, index }) => ({
          title: (row as TraitRow | undefined)?.name || `Trait ${index + 1}`,
          eyebrow: (row as TraitRow | undefined)?.kind === 'grant' ? 'Grant' : 'Custom',
        })}
      />
    </FormProvider>
  )
}

describe('FormEmbeddedMasterDetailEditor', () => {
  it('renders an empty list with the add control', () => {
    render(<EditorShell />)
    expect(screen.getByRole('button', { name: /Add trait/i })).toBeInTheDocument()
    expect(screen.getByText(/No traits yet/i)).toBeInTheDocument()
    expect(screen.getByText(masterDetailEmptySelectionLabel('trait'))).toBeInTheDocument()
  })

  it('adds a row and shows the detail form for the selection', async () => {
    const user = userEvent.setup()
    render(<EditorShell />)

    await user.click(screen.getByRole('button', { name: /Add trait/i }))

    await waitFor(() => {
      expect(screen.getByTestId('detail-traits-0')).toHaveTextContent('traits.0')
    })
  })

  it('confirms deletion through the shared dialog', async () => {
    const user = userEvent.setup()
    render(
      <EditorShell
        entitySource="homebrew"
        traits={[{ kind: 'custom', name: 'Darkvision', grants: [] }]}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Remove Darkvision/i }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Delete trait?')

    await user.click(screen.getByRole('button', { name: /^Delete$/ }))

    await waitFor(() => {
      expect(screen.getByText(/No traits yet/i)).toBeInTheDocument()
    })
  })

  it('locks system seed rows on a system entity', () => {
    render(
      <EditorShell
        entitySource="system"
        embeddedSeedRowIds={{ traits: ['t1'] }}
        traits={[{ id: 't1', kind: 'custom', name: 'Darkvision', grants: [] }]}
      />,
    )

    expect(screen.getByText('System')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Remove Darkvision/i })).not.toBeInTheDocument()
  })

  it('shows the active in campaign toggle on the detail panel', () => {
    render(
      <EditorShell
        entitySource="homebrew"
        traits={[{ kind: 'custom', name: 'Darkvision', grants: [] }]}
      />,
    )

    expect(screen.getByRole('switch', { name: /Active in campaign/i })).toBeInTheDocument()
  })

  it('renders leadingContent above the grid with collapse-safe field-group spacing', () => {
    function LeadingContentShell() {
      const form = useForm({ defaultValues: { traits: [] } })
      return (
        <FormProvider {...form}>
          <FormEmbeddedMasterDetailEditor
            formCtx={{}}
            fieldName="traits"
            itemFields={[{ type: 'text', name: 'name', label: 'Name' }]}
            itemNoun="trait"
            ariaLabel="Traits"
            addLabel="Add trait"
            emptyListLabel="No traits yet. Add one to get started."
            idPrefix="species-trait"
            leadingContent={<p>Choose how many traits apply.</p>}
            mapListItem={({ index }) => ({ title: `Trait ${index + 1}` })}
          />
        </FormProvider>
      )
    }

    render(<LeadingContentShell />)

    expect(screen.getByText('Choose how many traits apply.')).toBeInTheDocument()
    const leading = screen.getByText('Choose how many traits apply.')
    const stack = leading.parentElement
    const grid = stack?.querySelector('.grid')
    expect(stack).toHaveClass('flex', 'flex-col', 'gap-8')
    expect(grid?.parentElement).toBe(stack)
  })
})
