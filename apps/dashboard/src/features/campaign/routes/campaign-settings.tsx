import { useMemo, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { Heading, Spinner, Text } from '@rpg/ui'
import { TabbedForm, FormSaveFooter, type TabbedFormTab } from '@rpg/ui/form'

import { NarrowPage } from '@/components/layout/narrow-page'
import { useSubmitHandler } from '@/lib/use-submit-handler'
import { FormUnsavedChangesGuard } from '@/lib/form-unsaved-changes-guard'
import { useExistingImageField } from '@/lib/use-existing-image-field'
import { buildActiveCreatureTypeFieldOptions, useCreatureTypeVocabulary } from '@/features/homebrew'

import { buildRulesFields, flavorFields, identityFields } from '../lib/campaign-fields'
import {
  buildUpdateCampaignInput,
  mapCampaignToSettingsValues,
  resolveCampaignSettingsSchema,
  type CampaignSettingsValues,
} from '../lib/campaign-settings-values'
import { useCampaigns } from '../hooks/use-campaigns'
import { usePersistViewedCampaign } from '../hooks/use-persist-viewed-campaign'
import { useUpdateCampaign } from '../hooks/use-update-campaign'

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
  const {
    vocabulary,
    isPending: isVocabularyPending,
    isError: isVocabularyError,
  } = useCreatureTypeVocabulary(campaignId)

  usePersistViewedCampaign(campaignId)

  const { mutateAsync, isPending, isSuccess } = useUpdateCampaign(campaignId ?? '')

  const bannerField = useExistingImageField({
    fieldName: 'banner',
    currentKey: campaign?.identity.imageKey,
    label: 'Current campaign image',
    uploadErrorMessage: 'Could not upload campaign image.',
  })

  const tabs = useMemo((): TabbedFormTab[] => {
    const creatureTypeOptions = buildActiveCreatureTypeFieldOptions(vocabulary)
    return [
      { id: 'identity', label: 'Identity', fields: identityFields },
      { id: 'rules', label: 'Rules', fields: buildRulesFields(creatureTypeOptions) },
      { id: 'flavor', label: 'Flavor', fields: flavorFields },
    ]
  }, [vocabulary])

  const schema = useMemo(
    () => resolveCampaignSettingsSchema(vocabulary?.activeIds),
    [vocabulary?.activeIds],
  )

  const { onSubmit, formError } = useSubmitHandler<CampaignSettingsValues>(async (values, form) => {
    const imageKey = await bannerField.resolveImageKey(values.banner)
    await mutateAsync(buildUpdateCampaignInput(values, imageKey))
    form.reset(values)
  }, 'Could not save campaign.')

  let body: ReactNode

  if (isLoadingCampaigns || isVocabularyPending) {
    body = <Spinner />
  } else if (isError || isVocabularyError || !campaign) {
    body = (
      <Text variant="destructive" role="alert">
        {isError || isVocabularyError ? 'Could not load campaign.' : 'Campaign not found.'}
      </Text>
    )
  } else {
    body = (
      <TabbedForm<CampaignSettingsValues>
        key={campaign.id}
        schema={schema}
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
