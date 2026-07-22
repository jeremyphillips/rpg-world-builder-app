import { useMemo, useState } from 'react'
import { getErrorMessage } from '@rpg/contracts'
import { Heading, Wizard, type WizardStepDef } from '@rpg/ui'
import { WizardStepForm } from '@rpg/ui/form'

import { uploadFile } from '@/lib/api-client'
import { NarrowPage } from '@/components/layout/narrow-page'
import {
  createRulesFields,
  createRulesSchema,
  type CreateRulesValues,
} from '../lib/rules/character-configuration/character-configuration-form'
import { useCreateCampaign } from '../hooks/use-create-campaign'
import { useSelectCampaign } from '../hooks/use-select-campaign'
import {
  identitySchema,
  identityFields,
  flavorSchema,
  flavorFields,
  type IdentityValues,
  type FlavorValues,
} from '../lib/profile/campaign-profile-form-fields'
import {
  buildCreateCampaignInput,
  type CampaignCreateValues,
} from '../lib/campaign-settings-form-values'
import { ReviewStep } from '../components/steps/review-step'
import {
  BLANK_CAMPAIGN_TEMPLATE_VALUE,
  CampaignTemplateChooser,
} from '../components/campaign-template-chooser.client'
import { useCampaignTemplates } from '../hooks/use-campaign-templates'
import { mapCampaignTemplateToCreateValues } from '../lib/campaign-template-form-values'

const STEPS: WizardStepDef[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'rules', label: 'Rules' },
  { id: 'flavor', label: 'Flavor' },
  { id: 'review', label: 'Review' },
]

export function CampaignCreate() {
  const { mutateAsync } = useCreateCampaign()
  const selectCampaign = useSelectCampaign()
  const templatesQuery = useCampaignTemplates()
  const [createError, setCreateError] = useState<string | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState(BLANK_CAMPAIGN_TEMPLATE_VALUE)

  const selectedTemplate = useMemo(
    () => templatesQuery.data?.find((template) => template.metadata.id === selectedTemplateId),
    [selectedTemplateId, templatesQuery.data],
  )
  const initialValues = useMemo(
    () => (selectedTemplate ? mapCampaignTemplateToCreateValues(selectedTemplate) : {}),
    [selectedTemplate],
  )

  const onComplete = async (values: Record<string, unknown>) => {
    setCreateError(null)
    const createValues = values as CampaignCreateValues

    try {
      let imageKey: string | undefined
      if (createValues.banner?.[0]) {
        imageKey = await uploadFile(createValues.banner[0], 'Could not upload campaign image.')
      }

      const campaign = await mutateAsync(
        buildCreateCampaignInput(createValues, imageKey, selectedTemplate?.metadata.id),
      )

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
      <CampaignTemplateChooser
        templates={templatesQuery.data ?? []}
        value={selectedTemplateId}
        onValueChange={(value) => {
          setCreateError(null)
          setSelectedTemplateId(value)
        }}
        isPending={templatesQuery.isPending}
        isError={templatesQuery.isError}
      />
      <Wizard
        key={selectedTemplateId}
        steps={STEPS}
        onComplete={onComplete}
        initialValues={initialValues}
        hint="Configure rules later from Homebrew → Rules Configuration."
      >
        <WizardStepForm<IdentityValues> schema={identitySchema} fields={identityFields} />
        <WizardStepForm<CreateRulesValues> schema={createRulesSchema} fields={createRulesFields} />
        <WizardStepForm<FlavorValues> schema={flavorSchema} fields={flavorFields} />
        <ReviewStep
          error={createError}
          templateName={selectedTemplate?.metadata.name ?? 'Blank campaign'}
        />
      </Wizard>
    </NarrowPage>
  )
}
