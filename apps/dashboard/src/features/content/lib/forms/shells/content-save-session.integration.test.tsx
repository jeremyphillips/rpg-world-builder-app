import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'
import type { UseFormReturn } from 'react-hook-form'
import { Form } from '@rpg/ui/form'

import {
  CampaignAccessFormProvider,
  useCampaignAccessParticipantUpdater,
  type CampaignAccessSaveResult,
} from '../../campaign-access/campaign-access-form-context.client'
import { useContentSaveSession } from './use-content-save-session'

const schema = z.object({ name: z.string().min(1) })
const fields = [{ type: 'text' as const, name: 'name', label: 'Name', required: true }]

function AccessParticipant({
  isDirty,
  save,
  reset,
}: {
  isDirty: boolean
  save: () => Promise<CampaignAccessSaveResult>
  reset: () => void
}) {
  useCampaignAccessParticipantUpdater({
    isDirty,
    isPending: false,
    save,
    reset,
  })
  return null
}

function CoordinatedFooter({
  form,
  onSubmit,
}: {
  form: UseFormReturn<{ name: string }>
  onSubmit: (values: { name: string }) => Promise<void>
}) {
  const actionState = useContentSaveSession({
    mode: 'edit',
    pending: false,
    form,
    onSubmit: async (values) => onSubmit(values),
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
  accessSave,
  accessReset,
  onSubmit,
}: {
  accessDirty: boolean
  accessSave: () => Promise<CampaignAccessSaveResult>
  accessReset: () => void
  onSubmit: (values: { name: string }) => Promise<void>
}) {
  return (
    <CampaignAccessFormProvider>
      <AccessParticipant isDirty={accessDirty} save={accessSave} reset={accessReset} />
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ name: 'Original' }}
        onSubmit={async (values) => onSubmit(values)}
        footer={(form) => <CoordinatedFooter form={form} onSubmit={onSubmit} />}
      />
    </CampaignAccessFormProvider>
  )
}

describe('content save session integration', () => {
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
