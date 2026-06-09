import { useState } from 'react'
import { ApiError, fetchCsrfToken, getErrorMessage, type CreateCampaignInput } from '@rpg/contracts'
import { Wizard, type WizardStepDef } from '@rpg/ui'

import { CSRF_HEADER } from '@/lib/api-client'
import { useCreateCampaign } from '../hooks/use-create-campaign'
import { useSelectCampaign } from '../hooks/use-select-campaign'
import { IdentityStep } from '../components/steps/identity-step'
import { RulesStep } from '../components/steps/rules-step'
import { FlavorStep } from '../components/steps/flavor-step'
import { ReviewStep } from '../components/steps/review-step'

const STEPS: WizardStepDef[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'rules', label: 'Rules' },
  { id: 'flavor', label: 'Flavor' },
  { id: 'review', label: 'Review' },
]

interface WizardValues {
  name?: string
  description?: string
  banner?: File[]
  settings?: CreateCampaignInput['settings']
}

async function uploadBanner(file: File): Promise<string> {
  const csrfToken = await fetchCsrfToken()
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch('/api/uploads', {
    method: 'POST',
    credentials: 'include',
    headers: { [CSRF_HEADER]: csrfToken },
    body: fd,
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null
    throw new ApiError(
      res.status,
      'upload_failed',
      body?.error?.message ?? 'Could not upload campaign image.',
    )
  }
  const { key } = (await res.json()) as { key: string }
  return key
}

export function CampaignCreate() {
  const { mutateAsync } = useCreateCampaign()
  const selectCampaign = useSelectCampaign()
  const [createError, setCreateError] = useState<string | null>(null)

  const onComplete = async (values: Record<string, unknown>) => {
    setCreateError(null)
    const { name, description, banner, settings } = values as WizardValues

    try {
      let imageKey: string | undefined
      if (banner?.[0]) {
        imageKey = await uploadBanner(banner[0])
      }

      const campaign = await mutateAsync({
        name: name ?? '',
        description,
        imageKey,
        settings,
      })

      selectCampaign(campaign.id)
    } catch (err) {
      setCreateError(getErrorMessage(err, 'Could not create campaign.'))
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight">New campaign</h2>
      <Wizard
        steps={STEPS}
        onComplete={onComplete}
        hint="You can change these settings later from Campaign Settings."
      >
        <IdentityStep />
        <RulesStep />
        <FlavorStep />
        <ReviewStep error={createError} />
      </Wizard>
    </div>
  )
}
