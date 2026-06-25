import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { z } from 'zod'
import { TabbedForm, type TabbedFormTab } from '@rpg/ui/form'
import { useNavigate } from 'react-router-dom'
import { useFormState } from 'react-hook-form'

import { FormUnsavedChangesGuard } from './form-unsaved-changes-guard'
import { renderWithDataRouter } from './test-router'

const schema = z.object({ name: z.string().min(1) })
type Values = z.infer<typeof schema>

const tabs: TabbedFormTab[] = [
  {
    id: 'basics',
    label: 'Basics',
    fields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
  },
]

function CancelFooter({ backHref }: { backHref: string }) {
  const navigate = useNavigate()
  return (
    <>
      <FormUnsavedChangesGuard />
      <button type="button" onClick={() => navigate(backHref)}>
        Cancel
      </button>
    </>
  )
}

function DirtyProbe() {
  const { dirtyFields, isDirty } = useFormState()
  return (
    <div
      data-testid="dirty-state"
      data-is-dirty={String(isDirty)}
      data-dirty-fields={JSON.stringify(dirtyFields)}
    />
  )
}

function UnstableDefaultsShell() {
  const [, bump] = useState(0)
  // Simulate ContentEditFormReady passing a fresh toFormValues() object each render.
  const defaultValues = { name: 'Stable Name' }

  return (
    <div>
      <button type="button" onClick={() => bump((value) => value + 1)}>
        Bump parent
      </button>
      <TabbedForm<Values>
        schema={schema}
        tabs={tabs}
        defaultValues={defaultValues}
        onSubmit={() => undefined}
        footer={() => (
          <>
            <DirtyProbe />
            <CancelFooter backHref="/away" />
          </>
        )}
      />
    </div>
  )
}

describe('TabbedForm defaultValues instability', () => {
  it('does not mark the form dirty when parent re-renders with a new defaults object', async () => {
    const user = userEvent.setup()

    renderWithDataRouter(
      [
        { path: '/form', element: <UnstableDefaultsShell /> },
        { path: '/away', element: <div>Away page</div> },
      ],
      { initialEntries: ['/form'] },
    )

    await user.click(screen.getByRole('button', { name: 'Bump parent' }))
    await user.click(screen.getByRole('button', { name: 'Bump parent' }))

    await waitFor(() => {
      const probe = screen.getByTestId('dirty-state')
      expect(probe).toHaveAttribute('data-is-dirty', 'false')
      expect(probe).toHaveAttribute('data-dirty-fields', '{}')
    })

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(await screen.findByText('Away page')).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})
