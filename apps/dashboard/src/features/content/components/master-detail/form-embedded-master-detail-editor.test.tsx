import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TestFormShell } from '@/test/form-shell'
import { masterDetailEmptySelectionLabel } from '../../lib/master-detail/master-detail-constants'
import { FormEmbeddedMasterDetailEditor } from './form-embedded-master-detail-editor'

vi.mock('@rpg/ui/form', async (importOriginal) => {
  const { stubUiFormItems } = await import('@/test/mocks/ui-form')
  return stubUiFormItems(importOriginal)
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
  const itemFields = [{ type: 'text' as const, name: 'name', label: 'Name' }]

  return (
    <TestFormShell defaultValues={{ traits }}>
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
    </TestFormShell>
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

  it('renders leadingContent above the editor grid', () => {
    function LeadingContentShell() {
      return (
        <TestFormShell defaultValues={{ traits: [] }}>
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
        </TestFormShell>
      )
    }

    render(<LeadingContentShell />)

    const leading = screen.getByText('Choose how many traits apply.')
    const list = screen.getByRole('navigation', { name: 'Traits' })

    // Leading content must precede the editor grid in document order.
    expect(leading.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
