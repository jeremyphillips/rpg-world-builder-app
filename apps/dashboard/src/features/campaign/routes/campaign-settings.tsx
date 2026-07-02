import { useMemo, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { Heading, Spinner, Text } from '@rpg/ui'
import { TabbedForm, FormSaveFooter, type TabbedFormTab } from '@rpg/ui/form'

import { NarrowPage } from '@/components/layout/narrow-page'
import { useSubmitHandler } from '@/lib/use-submit-handler'
import { FormUnsavedChangesGuard } from '@/lib/form-unsaved-changes-guard'
import { useExistingImageField } from '@/lib/use-existing-image-field'

import { flavorFields, identityFields } from '../lib/profile/campaign-profile-form-fields'
import {
  buildUpdateCampaignInput,
  campaignSettingsSchema,
  mapCampaignToSettingsValues,
  type CampaignSettingsValues,
} from '../lib/campaign-settings-form-values'
import { useCampaigns } from '../hooks/use-campaigns'
import { usePersistViewedCampaign } from '../hooks/use-persist-viewed-campaign'
import { useUpdateCampaign } from '../hooks/use-update-campaign'

function CampaignSettingsHeading() {
  return (
    <Heading variant="page" as="h1">
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

  const tabs = useMemo(
    (): TabbedFormTab[] => [
      { id: 'identity', label: 'Identity', fields: identityFields },
      { id: 'flavor', label: 'Flavor', fields: flavorFields },
    ],
    [],
  )

  const { onSubmit, formError } = useSubmitHandler<CampaignSettingsValues>(async (values, form) => {
    const imageKey = await bannerField.resolveImageKey(values.banner)
    await mutateAsync(buildUpdateCampaignInput(values, imageKey))
    form.reset(values)
  }, 'Could not save campaign.')

  let body: ReactNode

  if (isLoadingCampaigns) {
    body = <Spinner />
  } else if (isError || !campaign) {
    body = (
      <Text variant="destructive" role="alert">
        {isError ? 'Could not load campaign.' : 'Campaign not found.'}
      </Text>
    )
  } else {
    body = (
      <TabbedForm<CampaignSettingsValues>
        key={campaign.id}
        uiStateKey={campaign.id}
        schema={campaignSettingsSchema}
        tabs={tabs}
        defaultValues={mapCampaignToSettingsValues(campaign)}
        fileFieldProps={bannerField.fileFieldProps}
        onSubmit={onSubmit}
        formError={formError}
        footer={(form) => (
          <>
            <FormUnsavedChangesGuard />
            <FormSaveFooter
              pending={isPending || form.formState.isSubmitting}
              isSuccess={isSuccess}
              submitLabel="Save changes"
              successMessage="Changes saved."
            />
          </>
        )}
      />
    )
  }

  return (
    <NarrowPage>
      <CampaignSettingsHeading />
      {body}
    </NarrowPage>
  )
}
