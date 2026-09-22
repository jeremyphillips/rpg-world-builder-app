import { useCallback, useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { resolveCampaignIdFromContext } from '@rpg/contracts'
import type { CharacterBuildContext, CharacterBuilderDraft } from '@rpg/contracts'
import { Button, Text } from '@rpg/ui'

import { useLocations } from '@/features/content'

import type { IdentityFormValues } from '../../../../lib/steps/identity-form-fields'
import {
  canGenerateNarrative,
  NARRATIVE_ALL_FIELDS_FILLED_MESSAGE,
  runNarrativeGeneration,
} from './identity-narrative-generate-action.lib'

export function IdentityNarrativeGenerateAction({
  context,
  draft,
}: {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
}) {
  const form = useFormContext<IdentityFormValues>()
  const values = useWatch({ control: form.control })
  const campaignId = resolveCampaignIdFromContext(context)
  const locationsQuery = useLocations(campaignId)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [messageTone, setMessageTone] = useState<'destructive' | 'muted'>('destructive')

  const canGenerate = useMemo(() => canGenerateNarrative(values.narrative), [values.narrative])
  const allFieldsFilled = !canGenerate
  const isLocationsPending =
    Boolean(campaignId) && locationsQuery.isPending && locationsQuery.data === undefined

  const handleGenerate = useCallback(async () => {
    if (pending || !canGenerate || isLocationsPending) return
    setPending(true)
    setMessage(undefined)
    const feedback = await runNarrativeGeneration({
      form,
      draft,
      context,
      campaignId,
      locations: campaignId ? (locationsQuery.data ?? []) : [],
      locationsQueryError: locationsQuery.error,
      locationsQueryIsError: locationsQuery.isError,
    })
    if (feedback) {
      setMessageTone(feedback.tone)
      setMessage(feedback.message)
    }
    setPending(false)
  }, [
    campaignId,
    canGenerate,
    context,
    draft,
    form,
    isLocationsPending,
    locationsQuery.data,
    locationsQuery.error,
    locationsQuery.isError,
    pending,
  ])

  const statusMessage = allFieldsFilled ? NARRATIVE_ALL_FIELDS_FILLED_MESSAGE : message

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <Text as="h3" variant="muted" className="text-sm">
          Generate a background
        </Text>
        <Text variant="muted" className="text-sm">
          Create aligned traits, ideals, bonds, flaws, and a first-person backstory.
        </Text>
        {statusMessage ? (
          <Text
            variant={allFieldsFilled ? 'muted' : messageTone}
            className="text-sm"
            aria-live="polite"
          >
            {statusMessage}
          </Text>
        ) : null}
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={handleGenerate}
        disabled={!canGenerate || pending || isLocationsPending}
      >
        {pending ? 'Generating…' : 'Generate background'}
      </Button>
    </div>
  )
}
