import { useParams } from 'react-router-dom'
import { Heading, Spinner, Text } from '@rpg/ui'
import { TabbedForm, FormSaveFooter, type TabbedFormTab } from '@rpg/ui/form'

import { useSubmitHandler } from '@/lib/use-submit-handler'
import { useExistingImageField } from '@/lib/use-existing-image-field'
import { identityFields, rulesFields, flavorFields } from '../lib/campaign-fields'
import {
  campaignSettingsSchema,
  mapCampaignToSettingsValues,
  buildUpdateCampaignInput,
  type CampaignSettingsValues,
} from '../lib/campaign-settings-values'
import { useCampaigns } from '../hooks/use-campaigns'
import { usePersistViewedCampaign } from '../hooks/use-persist-viewed-campaign'
import { useUpdateCampaign } from '../hooks/use-update-campaign'

const tabs: TabbedFormTab[] = [
  { id: 'identity', label: 'Identity', fields: identityFields },
  { id: 'rules', label: 'Rules', fields: rulesFields },
  { id: 'flavor', label: 'Flavor', fields: flavorFields },
]

function CampaignSettingsHeading() {
  return (
    <Heading variant="page" as="h2">
      Campaign Settings
    </Heading>
  )
}

export function CampaignSettings() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { data: campaigns, isPending: isLoadingCampaigns, isError } = useCampaigns()
  const campaign = campaigns?.find((c) => c.id === campaignId)

  usePersistViewedCampaign(campaignId)

  const { mutateAsync, isPending, isSuccess } = useUpdateCampaign(campaignId ?? '')

  const bannerField = useExistingImageField({
    fieldName: 'banner',
    currentKey: campaign?.identity.imageKey,
    label: 'Current campaign image',
    uploadErrorMessage: 'Could not upload campaign image.',
  })

  const { onSubmit, formError } = useSubmitHandler<CampaignSettingsValues>(async (values) => {
    const imageKey = await bannerField.resolveImageKey(values.banner)
    await mutateAsync(buildUpdateCampaignInput(values, imageKey))
  }, 'Could not save campaign.')

  if (isLoadingCampaigns) {
    return (
      <div className="mx-auto max-w-3xl space-y-2">
        <CampaignSettingsHeading />
        <Spinner />
      </div>
    )
  }

  if (isError || !campaign) {
    return (
      <div className="mx-auto max-w-3xl space-y-2">
        <CampaignSettingsHeading />
        <Text variant="destructive" role="alert">
          {isError ? 'Could not load campaign.' : 'Campaign not found.'}
        </Text>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-2">
      <CampaignSettingsHeading />
      {/* key forces a remount once the campaign loads so RHF initialises with the correct defaults */}
      <TabbedForm<CampaignSettingsValues>
        key={campaign.id}
        schema={campaignSettingsSchema}
        tabs={tabs}
        defaultValues={mapCampaignToSettingsValues(campaign)}
        fileFieldProps={bannerField.fileFieldProps}
        onSubmit={onSubmit}
        formError={formError}
        footer={(form) => (
          <FormSaveFooter
            pending={isPending || form.formState.isSubmitting}
            isSuccess={isSuccess}
            submitLabel="Save changes"
            successMessage="Changes saved."
          />
        )}
      />
    </div>
  )
}
