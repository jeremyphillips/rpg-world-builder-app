import { useMemo, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { Heading, Icon, Spinner, Text } from '@rpg/ui'
import {
  TabbedForm,
  FormSaveFooter,
  collectTabbedFormResolverItems,
  type TabbedFormTab,
} from '@rpg/ui/form'

import { PageShell } from '@/components/layout/page/page-shell'
import { useRunnerFormSubmit } from '@/lib/runner-form-submit.lib'
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
          leadingIcon: <Icon name="settings-sliders" size="sm" />,
          fields: settingsIdentityFields,
        },
      ]
    }

    return [
      {
        id: 'identity',
        label: 'Identity',
        leadingIcon: <Icon name="settings-sliders" size="sm" />,
        fields: buildSettingsIdentityTabFields(campaignId),
      },
      {
        id: 'flavor',
        label: 'Flavor',
        leadingIcon: <Icon name="palette" size="sm" />,
        fields: flavorFields,
      },
      {
        id: 'world',
        label: 'World',
        leadingIcon: <Icon name="globe" size="sm" />,
        fields: buildWorldSettingsFields(locations),
      },
    ]
  }, [campaignId, locations])

  const resolverFields = useMemo(() => collectTabbedFormResolverItems(tabs), [tabs])

  const { onSubmit, formError, ProducerBoundary } = useRunnerFormSubmit<CampaignSettingsValues>({
    schema: campaignSettingsSchema,
    resolverFields,
    formId: `campaign-settings-${campaign?.id ?? campaignId ?? 'new'}`,
    invalidPresentation: {
      resolverFields,
      formId: `campaign-settings-${campaign?.id ?? campaignId ?? 'new'}`,
      resolveViewForPath: (path) => {
        if (path.startsWith('flavor') || path === 'description') return 'flavor'
        if (path.startsWith('world') || path === 'defaultLocationId') return 'world'
        return 'identity'
      },
    },
    fallbackMessage: 'Could not save campaign.',
    persist: async (values, form) => {
      await mutateAsync(buildUpdateCampaignInput(values))
      form.reset(values)
      notifySaveSuccess()
    },
  })

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
        publishPresentationEnabled
        producerBoundary={ProducerBoundary}
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
    <PageShell width="narrow">
      <CampaignSettingsHeading />
      {body}
    </PageShell>
  )
}
