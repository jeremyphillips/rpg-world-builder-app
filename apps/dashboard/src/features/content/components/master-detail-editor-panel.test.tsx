import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import type { ComponentProps } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import { masterDetailEmptySelectionLabel } from '../lib/master-detail-constants'
import type { UseMasterDetailArrayResult } from '../lib/use-master-detail-array'
import { MasterDetailEditorPanel } from './master-detail-editor-panel.client'

vi.mock('@rpg/ui/form', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    FormItems: ({ namePrefix }: { namePrefix?: string }) => (
      <div data-testid="detail-form">{namePrefix}</div>
    ),
  }
})

function makeEditor(
  overrides: Partial<UseMasterDetailArrayResult> = {},
): UseMasterDetailArrayResult {
  return {
    fields: [{ id: 'field-a' }],
    selectedIndex: 0,
    select: vi.fn(),
    handleAdd: vi.fn(),
    deleteIndex: null,
    requestRemove: vi.fn(),
    cancelRemove: vi.fn(),
    confirmRemove: vi.fn(),
    hasRowError: vi.fn(() => false),
    autoSelectFirstInvalid: vi.fn(),
    move: vi.fn(),
    moveUp: vi.fn(),
    moveDown: vi.fn(),
    activeById: {},
    isRowActive: vi.fn(() => true),
    setRowActive: vi.fn(),
    ...overrides,
  }
}

function PanelShell(props: ComponentProps<typeof MasterDetailEditorPanel>) {
  const form = useForm({ defaultValues: { traits: [{ name: 'Rage' }] } })
  return (
    <FormProvider {...form}>
      <MasterDetailEditorPanel {...props} />
    </FormProvider>
  )
}

const axeOptions = { rules: { 'color-contrast': { enabled: false } } }

describe('MasterDetailEditorPanel', () => {
  const itemFields = [{ type: 'text' as const, name: 'name', label: 'Name' }]

  it('renders the selected row form', () => {
    render(
      <PanelShell
        editor={makeEditor()}
        itemFields={itemFields}
        fieldName="traits"
        idPrefix="species-trait"
        showValidationBanner={false}
        emptySelectionLabel={masterDetailEmptySelectionLabel('trait')}
      />,
    )

    expect(screen.getByTestId('detail-form')).toHaveTextContent('traits.0')
  })

  it('renders the empty-selection hint when nothing is selected', () => {
    render(
      <PanelShell
        editor={makeEditor({ selectedIndex: null })}
        itemFields={itemFields}
        fieldName="traits"
        idPrefix="species-trait"
        showValidationBanner={false}
        emptySelectionLabel={masterDetailEmptySelectionLabel('trait')}
      />,
    )

    expect(screen.getByText(masterDetailEmptySelectionLabel('trait'))).toBeInTheDocument()
    expect(screen.queryByTestId('detail-form')).not.toBeInTheDocument()
  })

  it('hides the empty-selection hint when the validation banner is visible', () => {
    render(
      <PanelShell
        editor={makeEditor({ selectedIndex: null })}
        itemFields={itemFields}
        fieldName="traits"
        idPrefix="species-trait"
        showValidationBanner
        emptySelectionLabel={masterDetailEmptySelectionLabel('trait')}
      />,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.queryByText(masterDetailEmptySelectionLabel('trait'))).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations when a row is selected', async () => {
    const { container } = render(
      <PanelShell
        editor={makeEditor()}
        itemFields={itemFields}
        fieldName="traits"
        idPrefix="species-trait"
        showValidationBanner={false}
        emptySelectionLabel={masterDetailEmptySelectionLabel('trait')}
      />,
    )

    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
  })
})
