import { useMemo, type ReactNode } from 'react'
import { Globe, IdCard, Palette } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { Heading, Spinner, Text } from '@rpg/ui'
import { TabbedForm, FormSaveFooter, type TabbedFormTab } from '@rpg/ui/form'

import { NarrowPage } from '@/components/layout/page/narrow-page'
import { useSubmitHandler } from '@/lib/use-submit-handler'
import { notifySaveSuccess } from '@/lib/notify'
import { FormUnsavedChangesGuard } from '@/lib/form-unsaved-changes-guard'
import { useLocations } from '@/features/content'
import {
  buildSettingsIdentityTabFields,
  flavorFields,
  settingsIdentityFields,
} from '../lib/settings/campaign-profile-form-fields'
import { buildWorldSettingsFields } from '../lib/settings/world-settings-form-fields'
import {
  buildUpdateCampaignInput,
  campaignSettingsSchema,
  mapCampaignToSettingsValues,
  type CampaignSettingsValues,
} from '../lib/settings/campaign-settings-form-values'
import { useCampaigns } from '../hooks/use-campaigns'
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
  const { data: locations } = useLocations(campaignId ?? '')

  const { mutateAsync, isPending } = useUpdateCampaign(campaignId ?? '')

  const tabs = useMemo((): TabbedFormTab[] => {
    if (!campaignId) {
      return [
        {
          id: 'identity',
          label: 'Identity',
          leadingIcon: <IdCard aria-hidden />,
          fields: settingsIdentityFields,
        },
      ]
    }

    return [
      {
        id: 'identity',
        label: 'Identity',
        leadingIcon: <IdCard aria-hidden />,
        fields: buildSettingsIdentityTabFields(campaignId),
      },
      {
        id: 'flavor',
        label: 'Flavor',
        leadingIcon: <Palette aria-hidden />,
        fields: flavorFields,
      },
      {
        id: 'world',
        label: 'World',
        leadingIcon: <Globe aria-hidden />,
        fields: buildWorldSettingsFields(locations),
      },
    ]
  }, [campaignId, locations])

  const { onSubmit, formError } = useSubmitHandler<CampaignSettingsValues>(async (values, form) => {
    await mutateAsync(buildUpdateCampaignInput(values))
    form.reset(values)
    notifySaveSuccess()
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
        onSubmit={onSubmit}
        formError={formError}
        documentScroll
        footer={(form) => (
          <>
            <FormUnsavedChangesGuard />
            <FormSaveFooter
              pending={isPending || form.formState.isSubmitting}
              submitLabel="Save changes"
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
