import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TestFormShell } from '@/test/form-shell'
import { defineMasterDetailItemNoun } from '../../../lib/master-detail/master-detail-item-noun'
import { FormEmbeddedMasterDetailEditor } from '../form-embedded-master-detail-editor'

vi.mock('@rpg/ui/form', async (importOriginal) => {
  const { stubUiFormItems } = await import('@/test/mocks/ui-form')
  return stubUiFormItems(importOriginal)
})

const FORM_ITEM_NOUN = defineMasterDetailItemNoun({
  label: 'Form',
  singular: 'form',
  plural: 'forms',
})

const DOMAIN_ROW_ID = 'domain-row-1'

function AcquisitionEditor() {
  return (
    <TestFormShell defaultValues={{ forms: [] }}>
      <FormEmbeddedMasterDetailEditor<{ id: string; name?: string }>
        formCtx={{}}
        fieldName="forms"
        itemFields={[{ type: 'text', name: 'description', label: 'Description' }]}
        itemNoun={FORM_ITEM_NOUN}
        listTitle="Forms"
        ariaLabel="Forms"
        addLabel="Add form"
        idPrefix="creature-form"
        makeItemDefaults={() => ({ id: DOMAIN_ROW_ID, name: '' })}
        rowTitle={{ strategy: 'authored', field: 'name' }}
        resolveFieldSections={() => ({
          primary: [{ type: 'text', name: 'description', label: 'Description' }],
        })}
      />
    </TestFormShell>
  )
}

describe('master detail title acquisition', () => {
  it('opens and focuses the header name field after adding an unnamed row with a domain id', async () => {
    const user = userEvent.setup()
    render(<AcquisitionEditor />)
    await user.click(screen.getByRole('button', { name: /Add form/i }))

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus()
    })
  })

  it('keeps focus on the header when the title owns acquisition', async () => {
    const user = userEvent.setup()
    render(<AcquisitionEditor />)
    await user.click(screen.getByRole('button', { name: /Add form/i }))

    await waitFor(() => {
      const titleInput = screen.getByRole('textbox', { name: 'Name' })
      expect(titleInput).toHaveFocus()
      expect(document.activeElement).toBe(titleInput)
    })
  })
})
