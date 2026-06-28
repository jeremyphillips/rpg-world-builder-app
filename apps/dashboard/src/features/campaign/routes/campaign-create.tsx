import { useState } from 'react'
import { getErrorMessage } from '@rpg/contracts'
import { Heading, Wizard, type WizardStepDef } from '@rpg/ui'
import { WizardStepForm } from '@rpg/ui/form'

import { uploadFile } from '@/lib/api-client'
import { NarrowPage } from '@/components/layout/narrow-page'
import {
  createRulesFields,
  createRulesSchema,
  type CreateRulesValues,
} from '../lib/character-configuration-fields'
import { useCreateCampaign } from '../hooks/use-create-campaign'
import { useSelectCampaign } from '../hooks/use-select-campaign'
import {
  identitySchema,
  identityFields,
  flavorSchema,
  flavorFields,
  type IdentityValues,
  type FlavorValues,
} from '../lib/campaign-fields'
import {
  buildCreateCampaignInput,
  type CampaignCreateValues,
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
    const createValues = values as CampaignCreateValues

    try {
      let imageKey: string | undefined
      if (createValues.banner?.[0]) {
        imageKey = await uploadFile(createValues.banner[0], 'Could not upload campaign image.')
      }

      const campaign = await mutateAsync(buildCreateCampaignInput(createValues, imageKey))

      selectCampaign(campaign.id)
    } catch (err) {
      setCreateError(getErrorMessage(err, 'Could not create campaign.'))
    }
  }

  return (
    <NarrowPage>
      <Heading variant="page" as="h1">
        New campaign
      </Heading>
      <Wizard
        steps={STEPS}
        onComplete={onComplete}
        hint="Configure rules later from Homebrew → Rules Configuration."
      >
        <WizardStepForm<IdentityValues> schema={identitySchema} fields={identityFields} />
        <WizardStepForm<CreateRulesValues> schema={createRulesSchema} fields={createRulesFields} />
        <WizardStepForm<FlavorValues> schema={flavorSchema} fields={flavorFields} />
        <ReviewStep error={createError} />
      </Wizard>
    </NarrowPage>
  )
}
