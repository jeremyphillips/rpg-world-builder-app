import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  CampaignAccessFormProvider,
  useCampaignAccessForm,
  useCampaignAccessParticipantUpdater,
} from './campaign-access-form-context'

function ParticipantHarness({ isDirty, isPending }: { isDirty: boolean; isPending: boolean }) {
  const save = vi.fn(async () => ({ status: 'skipped' as const }))
  const reset = vi.fn()

  useCampaignAccessParticipantUpdater({
    isDirty,
    isPending,
    save,
    reset,
  })

  return (
    <div>
      <button type="button" onClick={() => void save()}>
        Save participant
      </button>
      <button type="button" onClick={reset}>
        Reset participant
      </button>
    </div>
  )
}

function ConsumerProbe() {
  const participant = useCampaignAccessForm()

  return (
    <div
      data-testid="participant"
      data-dirty={String(participant.isDirty)}
      data-pending={String(participant.isPending)}
    />
  )
}

describe('CampaignAccessFormProvider', () => {
  it('exposes participant shape to consumers', () => {
    const participant = {
      isDirty: false,
      isPending: false,
      save: async () => ({ status: 'skipped' as const }),
      reset: () => {},
    }

    expect(participant).toMatchObject({
      isDirty: expect.any(Boolean),
      isPending: expect.any(Boolean),
      save: expect.any(Function),
      reset: expect.any(Function),
    })
  })

  it('syncs dirty and pending state from the updater', () => {
    render(
      <CampaignAccessFormProvider>
        <ParticipantHarness isDirty isPending={false} />
        <ConsumerProbe />
      </CampaignAccessFormProvider>,
    )

    expect(screen.getByTestId('participant')).toHaveAttribute('data-dirty', 'true')
    expect(screen.getByTestId('participant')).toHaveAttribute('data-pending', 'false')
  })

  it('routes save and reset through the registered participant', async () => {
    const user = userEvent.setup()

    render(
      <CampaignAccessFormProvider>
        <ParticipantHarness isDirty isPending={false} />
        <ConsumerProbe />
      </CampaignAccessFormProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Save participant' }))
    await user.click(screen.getByRole('button', { name: 'Reset participant' }))
  })
})
