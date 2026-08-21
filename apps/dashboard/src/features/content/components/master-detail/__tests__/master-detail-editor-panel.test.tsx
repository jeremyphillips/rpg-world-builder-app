import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { TestFormShell } from '@/test/form-shell'
import { masterDetailEmptySelectionLabel } from '../../../lib/master-detail/master-detail-constants'
import type { UseMasterDetailArrayResult } from '../../../lib/master-detail/use-master-detail-array'
import { MasterDetailEditorPanel } from '../master-detail-editor-panel'

vi.mock('@rpg/ui/form', async (importOriginal) => {
  const { stubUiFormItems } = await import('@/test/mocks/ui-form')
  return stubUiFormItems(importOriginal, 'detail-form')
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
    ...overrides,
  }
}

function PanelShell(props: ComponentProps<typeof MasterDetailEditorPanel>) {
  return (
    <TestFormShell defaultValues={{ traits: [{ name: 'Rage' }] }}>
      <MasterDetailEditorPanel {...props} />
    </TestFormShell>
  )
}

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

  itAxe('has no axe accessibility violations when a row is selected', async () => {
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

    await expectNoAxeViolations(container)
  })
})
