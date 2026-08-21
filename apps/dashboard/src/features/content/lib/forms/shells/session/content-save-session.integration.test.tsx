import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'
import type { UseFormReturn } from 'react-hook-form'
import { Form } from '@rpg/ui/form'

import {
  CampaignAccessFormProvider,
  useCampaignAccessParticipantUpdater,
  type CampaignAccessSaveResult,
} from '../../../campaign-access/campaign-access-form-context.client'
import { notifyCoordinatedContentSaveSuccess } from '@/lib/notify'
import { useContentSaveSession } from './use-content-save-session'

const toastSuccess = vi.hoisted(() => vi.fn())

import type * as RpgUi from '@rpg/ui'

vi.mock('@rpg/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof RpgUi>()
  return {
    ...actual,
    toast: Object.assign(vi.fn(), {
      ...actual.toast,
      success: toastSuccess,
      error: vi.fn(),
      warning: vi.fn(),
    }),
  }
})

const schema = z.object({ name: z.string().min(1) })
const fields = [{ type: 'text' as const, name: 'name', label: 'Name', required: true }]

function AccessParticipant({
  isDirty,
  pendingAvailable,
  accessAvailabilityChanged = true,
  save,
  reset,
}: {
  isDirty: boolean
  pendingAvailable: boolean
  accessAvailabilityChanged?: boolean
  save: () => Promise<CampaignAccessSaveResult>
  reset: () => void
}) {
  useCampaignAccessParticipantUpdater({
    isDirty,
    isPending: false,
    save,
    reset,
    readPendingAvailable: () => pendingAvailable,
    readAccessAvailabilityChanged: () => accessAvailabilityChanged,
  })
  return null
}

function CoordinatedFooter({
  form,
  onSubmit,
  entityName,
}: {
  form: UseFormReturn<{ name: string }>
  onSubmit: (values: { name: string }) => Promise<void>
  entityName: string
}) {
  const actionState = useContentSaveSession({
    mode: 'edit',
    pending: false,
    form,
    onSubmit: async (values) => onSubmit(values),
    onSaved: (event) => notifyCoordinatedContentSaveSuccess(event, entityName),
  })

  return (
    <>
      <button
        type="button"
        disabled={actionState.submitDisabled}
        onClick={() => void actionState.save()}
      >
        Save changes
      </button>
      <button type="button" disabled={actionState.discardDisabled} onClick={actionState.discard}>
        Discard changes
      </button>
      <span data-testid="has-unsaved">{String(actionState.hasUnsavedEdits)}</span>
    </>
  )
}

const updatedAccessResult = {
  status: 'updated' as const,
  campaignAccess: {
    available: true,
    visibilityMode: 'all_players' as const,
    participantIds: [],
    unavailableParticipantIds: [],
    effectiveAudience: 'all_players' as const,
  },
}

function SaveSessionHarness({
  accessDirty,
  pendingAvailable = true,
  accessAvailabilityChanged = true,
  accessSave,
  accessReset,
  onSubmit,
  entityName = 'Fireball',
}: {
  accessDirty: boolean
  pendingAvailable?: boolean
  accessAvailabilityChanged?: boolean
  accessSave: () => Promise<CampaignAccessSaveResult>
  accessReset: () => void
  onSubmit: (values: { name: string }) => Promise<void>
  entityName?: string
}) {
  return (
    <CampaignAccessFormProvider>
      <AccessParticipant
        isDirty={accessDirty}
        pendingAvailable={pendingAvailable}
        accessAvailabilityChanged={accessAvailabilityChanged}
        save={accessSave}
        reset={accessReset}
      />
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ name: 'Original' }}
        onSubmit={async (values) => onSubmit(values)}
        footer={(form) => (
          <CoordinatedFooter form={form} onSubmit={onSubmit} entityName={entityName} />
        )}
      />
    </CampaignAccessFormProvider>
  )
}

describe('content save session integration', () => {
  beforeEach(() => {
    toastSuccess.mockReset()
  })

  it('enables save when only campaign access is dirty', () => {
    const accessSave = vi.fn(async () => updatedAccessResult)
    const accessReset = vi.fn()
    const onSubmit = vi.fn()

    render(
      <SaveSessionHarness
        accessDirty
        accessSave={accessSave}
        accessReset={accessReset}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByTestId('has-unsaved')).toHaveTextContent('true')
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Discard changes' })).toBeEnabled()
  })

  it('enables save when only the body form is dirty', async () => {
    const user = userEvent.setup()
    const accessSave = vi.fn(async () => ({ status: 'skipped' as const }))
    const accessReset = vi.fn()
    const onSubmit = vi.fn()

    render(
      <SaveSessionHarness
        accessDirty={false}
        accessSave={accessSave}
        accessReset={accessReset}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'x')
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled()
  })

  it('saves access before body when both are dirty', async () => {
    const user = userEvent.setup()
    const order: string[] = []
    const accessSave = vi.fn(async () => {
      order.push('access')
      return updatedAccessResult
    })
    const accessReset = vi.fn()
    const onSubmit = vi.fn(async () => {
      order.push('body')
    })

    render(
      <SaveSessionHarness
        accessDirty
        accessSave={accessSave}
        accessReset={accessReset}
        onSubmit={onSubmit}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: 'Name' }), ' edited')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(accessSave).toHaveBeenCalled()
    })
    expect(order[0]).toBe('access')
  })
})

describe('coordinated save success feedback', () => {
  beforeEach(() => {
    toastSuccess.mockReset()
  })

  it('shows one availability toast after access-only save', async () => {
    const user = userEvent.setup()
    const accessSave = vi.fn(async () => updatedAccessResult)
    const onSubmit = vi.fn()

    render(
      <SaveSessionHarness
        accessDirty
        pendingAvailable
        accessSave={accessSave}
        accessReset={vi.fn()}
        onSubmit={onSubmit}
        entityName="Fireball"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledOnce()
    })
    expect(toastSuccess).toHaveBeenCalledWith('"Fireball" is now available in this campaign.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows one changes-saved toast after body-only save', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <SaveSessionHarness
        accessDirty={false}
        accessSave={vi.fn(async () => ({ status: 'skipped' as const }))}
        accessReset={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'x')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
    })
    expect(toastSuccess).toHaveBeenCalledOnce()
    expect(toastSuccess).toHaveBeenCalledWith('Changes saved.')
  })

  it('shows one changes-saved toast when access and body both save', async () => {
    const user = userEvent.setup()
    const accessSave = vi.fn(async () => updatedAccessResult)
    const onSubmit = vi.fn()

    render(
      <SaveSessionHarness
        accessDirty
        pendingAvailable={false}
        accessSave={accessSave}
        accessReset={vi.fn()}
        onSubmit={onSubmit}
        entityName="Fireball"
      />,
    )

    await user.type(screen.getByRole('textbox', { name: 'Name' }), ' edited')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
    })
    expect(accessSave).toHaveBeenCalledOnce()
    expect(toastSuccess).toHaveBeenCalledOnce()
    expect(toastSuccess).toHaveBeenCalledWith('Changes saved.')
  })

  it('does not toast when body save fails', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(async () => {
      throw new Error('Network error')
    })

    render(
      <SaveSessionHarness
        accessDirty={false}
        accessSave={vi.fn(async () => ({ status: 'skipped' as const }))}
        accessReset={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'x')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
    })
    expect(toastSuccess).not.toHaveBeenCalled()
  })

  it('does not toast or hang when body validation fails', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <SaveSessionHarness
        accessDirty={false}
        accessSave={vi.fn(async () => ({ status: 'skipped' as const }))}
        accessReset={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    await user.clear(screen.getByRole('textbox', { name: 'Name' }))
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled()
    })
    expect(onSubmit).not.toHaveBeenCalled()
    expect(toastSuccess).not.toHaveBeenCalled()
  })

  it('shows changes-saved toast for visibility-only access edit', async () => {
    const user = userEvent.setup()
    const accessSave = vi.fn(async () => updatedAccessResult)
    const onSubmit = vi.fn()

    render(
      <SaveSessionHarness
        accessDirty
        pendingAvailable
        accessAvailabilityChanged={false}
        accessSave={accessSave}
        accessReset={vi.fn()}
        onSubmit={onSubmit}
        entityName="Fireball"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledOnce()
    })
    expect(toastSuccess).toHaveBeenCalledWith('Changes saved.')
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
