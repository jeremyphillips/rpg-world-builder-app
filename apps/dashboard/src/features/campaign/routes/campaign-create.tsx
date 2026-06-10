import { useState } from 'react'
import { getErrorMessage } from '@rpg/contracts'
import { Wizard, type WizardStepDef } from '@rpg/ui'
import { WizardStepForm } from '@rpg/ui/form'

import { uploadFile } from '@/lib/api-client'
import { useCreateCampaign } from '../hooks/use-create-campaign'
import { useSelectCampaign } from '../hooks/use-select-campaign'
import {
  identitySchema,
  identityFields,
  rulesSchema,
  rulesFields,
  flavorSchema,
  flavorFields,
  type IdentityValues,
  type RulesValues,
  type FlavorValues,
} from '../lib/campaign-fields'
import {
  buildCreateCampaignInput,
  type CampaignSettingsValues,
} from '../lib/campaign-settings-values'
import { ReviewStep } from '../components/steps/review-step'

const STEPS: WizardStepDef[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'rules', label: 'Rules' },
  { id: 'flavor', label: 'Flavor' },
  { id: 'review', label: 'Review' },
]

export function CampaignCreate() {
  const { mutateAsync } = useCreateCampaign()
  const selectCampaign = useSelectCampaign()
  const [createError, setCreateError] = useState<string | null>(null)

  const onComplete = async (values: Record<string, unknown>) => {
    setCreateError(null)
    const settingsValues = values as CampaignSettingsValues

    try {
      let imageKey: string | undefined
      if (settingsValues.banner?.[0]) {
        imageKey = await uploadFile(settingsValues.banner[0], 'Could not upload campaign image.')
      }

      const campaign = await mutateAsync(buildCreateCampaignInput(settingsValues, imageKey))

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
        <WizardStepForm<IdentityValues> schema={identitySchema} fields={identityFields} />
        <WizardStepForm<RulesValues> schema={rulesSchema} fields={rulesFields} />
        <WizardStepForm<FlavorValues> schema={flavorSchema} fields={flavorFields} />
        <ReviewStep error={createError} />
      </Wizard>
    </div>
  )
}
