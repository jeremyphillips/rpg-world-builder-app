import { useParams } from 'react-router-dom'
import type { z } from 'zod'
import { TabbedForm, type TabbedFormTab } from '@rpg/ui/form'
import { SubmitButton } from '@rpg/ui'

import type { UpdateCampaignInput } from '@rpg/contracts'
import {
  identitySchema,
  identityFields,
  rulesSchema,
  rulesFields,
  flavorSchema,
  flavorFields,
} from '../lib/campaign-fields'
import { usePersistViewedCampaign } from '../hooks/use-persist-viewed-campaign'
import { useUpdateCampaign } from '../hooks/use-update-campaign'

const campaignSettingsSchema = identitySchema.merge(rulesSchema).merge(flavorSchema)
type CampaignSettingsValues = z.infer<typeof campaignSettingsSchema>

const tabs: TabbedFormTab[] = [
  { id: 'identity', label: 'Identity', fields: identityFields },
  { id: 'rules', label: 'Rules', fields: rulesFields },
  { id: 'flavor', label: 'Flavor', fields: flavorFields },
]

export function CampaignSettings() {
  const { campaignId } = useParams<{ campaignId: string }>()

  usePersistViewedCampaign(campaignId)

  const { mutate, isPending, error } = useUpdateCampaign(campaignId ?? '')

  function onSubmit(values: CampaignSettingsValues) {
    const input: UpdateCampaignInput = {
      name: values.name,
      description: values.description,
      settings: {
        characterCreation: {
          startingLevel: values.startingLevel,
          importedCharacters: { policy: values.importedCharactersPolicy },
        },
      },
      flavor: {
        playStyle: values.playStyle,
        mood: values.mood,
        magicLevel: values.magicLevel,
        difficulty: values.difficulty,
      },
    }
    mutate(input)
  }

  const formError =
    error instanceof Error ? error.message : error ? 'Could not save campaign.' : undefined

  return (
    <div className="mx-auto max-w-3xl space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight">Campaign Settings</h2>
      <TabbedForm<CampaignSettingsValues>
        schema={campaignSettingsSchema}
        tabs={tabs}
        onSubmit={onSubmit}
        formError={formError}
        footer={(form) => (
          <div className="flex justify-end pt-2">
            <SubmitButton disabled={isPending || form.formState.isSubmitting}>
              {isPending ? 'Saving…' : 'Save changes'}
            </SubmitButton>
          </div>
        )}
      />
    </div>
  )
}
