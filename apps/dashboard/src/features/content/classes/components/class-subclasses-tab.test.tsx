import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { defaultCampaignRules } from '../../lib/form-options/content-campaign-rules'
import { makeQueryWrapper } from '@/test/make-wrapper'
import { SUBCLASSES_FOR_FIGHTER } from '../fixtures'
import { ClassSubclassesTab } from './class-subclasses-tab.client'

vi.mock('./subclass-editor-panel.client', () => ({
  SubclassEditorPanel: ({
    onActiveChange,
    onDeleteRequest,
  }: {
    onActiveChange: (active: boolean) => void
    onDeleteRequest: () => void
  }) => (
    <div>
      <button type="button" onClick={() => onActiveChange(false)}>
        Mock deactivate
      </button>
      <button type="button" onClick={onDeleteRequest}>
        Mock delete subclass
      </button>
    </div>
  ),
}))

const QueryWrapper = makeQueryWrapper()

function ClassFormShell({
  features = [
    {
      kind: 'subclass-choice',
      id: 'fighter-subclass',
      name: 'Fighter Subclass',
      level: 3,
      grants: [],
    },
  ],
  mode = 'edit' as const,
  formCtx = {},
}: {
  features?: Array<{ kind?: string; id: string; name: string; level: number; grants: never[] }>
  mode?: 'create' | 'edit'
  formCtx?: Record<string, unknown>
}) {
  const form = useForm({ defaultValues: { features } })
  return (
    <MemoryRouter>
      <QueryWrapper>
        <FormProvider {...form}>
          <ClassSubclassesTab
            campaignId="camp_1"
            classId="srd-cc-5.2.1:fighter"
            mode={mode}
            formCtx={formCtx}
            subclassesOverride={mode === 'edit' ? SUBCLASSES_FOR_FIGHTER : undefined}
          />
        </FormProvider>
      </QueryWrapper>
    </MemoryRouter>
  )
}

describe('ClassSubclassesTab', () => {
  it('shows create-mode message when class is not saved', () => {
    render(<ClassFormShell mode="create" />)
    expect(screen.getByText(/Save this class first/i)).toBeInTheDocument()
  })

  it('gates authoring when the subclass choice feature is missing', () => {
    render(<ClassFormShell features={[]} />)
    expect(screen.getByText(/Features/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Add subclass/i })).not.toBeInTheDocument()
  })

  it('adds a draft subclass and selects it in the editor', async () => {
    const user = userEvent.setup()
    render(<ClassFormShell />)

    await user.click(screen.getByRole('button', { name: /Add subclass/i }))

    expect(screen.getByText('Untitled subclass')).toBeInTheDocument()
    expect(screen.getByText('Unsaved')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Mock deactivate/i })).toBeInTheDocument()
  })

  it('marks a subclass inactive from the editor toggle', async () => {
    const user = userEvent.setup()
    render(<ClassFormShell />)

    await user.click(screen.getByRole('button', { name: /Champion/i }))
    await user.click(screen.getByRole('button', { name: /Mock deactivate/i }))

    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('opens ConfirmDialog and removes a draft on confirm', async () => {
    const user = userEvent.setup()
    render(<ClassFormShell />)

    await user.click(screen.getByRole('button', { name: /Add subclass/i }))
    await user.click(screen.getByRole('button', { name: /Delete Untitled subclass/i }))

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Delete$/ }))

    await waitFor(() => {
      expect(screen.queryByText('Untitled subclass')).not.toBeInTheDocument()
    })
  })

  it('shows a subclasses-disabled availability alert when subclassing is off', () => {
    render(
      <ClassFormShell
        formCtx={{
          campaignRules: {
            ...defaultCampaignRules(),
            subclassing: { enabled: false },
          },
        }}
      />,
    )

    expect(screen.getByText(/Subclass choices are disabled/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Enable subclasses' })).toHaveAttribute(
      'href',
      '/campaigns/camp_1/homebrew/rules-config/character-configuration#subclasses',
    )
    expect(screen.getByRole('button', { name: /Add subclass/i })).toBeInTheDocument()
  })
})
