import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAssetUrl } from '@rpg/contracts'
import { TabbedForm, type TabbedFormTab } from '@rpg/ui/form'
import { SubmitButton } from '@rpg/ui'

import { uploadFile } from '@/lib/api-client'
import { toFormError } from '@/lib/to-form-error'
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

const CURRENT_BANNER_LABEL = 'Current campaign image'

const tabs: TabbedFormTab[] = [
  { id: 'identity', label: 'Identity', fields: identityFields },
  { id: 'rules', label: 'Rules', fields: rulesFields },
  { id: 'flavor', label: 'Flavor', fields: flavorFields },
]

export function CampaignSettings() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { data: campaigns, isPending: isLoadingCampaigns, isError } = useCampaigns()
  const campaign = campaigns?.find((c) => c.id === campaignId)

  usePersistViewedCampaign(campaignId)

  const { mutateAsync, isPending, error, isSuccess } = useUpdateCampaign(campaignId ?? '')
  const [submitError, setSubmitError] = useState<unknown>(null)
  const [bannerCleared, setBannerCleared] = useState(false)

  useEffect(() => {
    setBannerCleared(false)
  }, [campaign?.id, campaign?.identity.imageKey])

  async function onSubmit(values: CampaignSettingsValues) {
    setSubmitError(null)
    try {
      let imageKey: string | undefined
      if (values.banner?.[0]) {
        imageKey = await uploadFile(values.banner[0], 'Could not upload campaign image.')
      } else if (bannerCleared) {
        imageKey = ''
      }
      await mutateAsync(buildUpdateCampaignInput(values, imageKey))
    } catch (err) {
      setSubmitError(err)
    }
  }

  if (isLoadingCampaigns) {
    return (
      <div className="mx-auto max-w-3xl space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Campaign Settings</h2>
        <p className="text-sm text-muted-foreground">Loading campaign…</p>
      </div>
    )
  }

  if (isError || !campaign) {
    return (
      <div className="mx-auto max-w-3xl space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Campaign Settings</h2>
        <p role="alert" className="text-sm text-destructive">
          {isError ? 'Could not load campaign.' : 'Campaign not found.'}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight">Campaign Settings</h2>
      {/* key forces a remount once the campaign loads so RHF initialises with the correct defaults */}
      <TabbedForm<CampaignSettingsValues>
        key={campaign.id}
        schema={campaignSettingsSchema}
        tabs={tabs}
        defaultValues={mapCampaignToSettingsValues(campaign)}
        fileFieldProps={{
          banner: {
            existingImageUrl:
              campaign.identity.imageKey && !bannerCleared
                ? getAssetUrl(campaign.identity.imageKey)
                : undefined,
            existingImageLabel: CURRENT_BANNER_LABEL,
            onClearExisting: () => setBannerCleared(true),
          },
        }}
        onSubmit={onSubmit}
        formError={toFormError(submitError ?? error, 'Could not save campaign.')}
        footer={(form) => (
          <div className="flex items-center justify-end gap-3 pt-2">
            {isSuccess ? <p className="text-sm text-muted-foreground">Changes saved.</p> : null}
            <SubmitButton disabled={isPending || form.formState.isSubmitting}>
              {isPending ? 'Saving…' : 'Save changes'}
            </SubmitButton>
          </div>
        )}
      />
    </div>
  )
}
