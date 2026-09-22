import { useCallback, useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  generateCharacterNarrative,
  buildNarrativeContext,
} from '@rpg/character-narrative-integrations'
import type { CharacterBuildContext, CharacterBuilderDraft } from '@rpg/contracts'
import { Button, Text } from '@rpg/ui'

import type { IdentityFormValues } from '../../../../lib/steps/identity-form-fields'
import {
  applyGeneratedNarrativeToForm,
  buildDraftFromIdentityValues,
  canGenerateNarrative,
  listCampaignLocations,
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
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()

  const canGenerate = useMemo(() => canGenerateNarrative(values.narrative), [values.narrative])

  const handleGenerate = useCallback(async () => {
    if (pending || !canGenerate) return
    setPending(true)
    setMessage(undefined)
    const snapshot = JSON.stringify(form.getValues())
    try {
      const locations = await listCampaignLocations(context)
      const currentValues = form.getValues()
      const currentDraft = buildDraftFromIdentityValues(draft, currentValues)
      const generationContext = buildNarrativeContext({
        draft: currentDraft,
        context,
        locations,
      })
      const result = await generateCharacterNarrative(
        generationContext,
        Math.floor(Math.random() * 2 ** 31),
      )
      if (JSON.stringify(form.getValues()) !== snapshot) {
        setMessage('Character details changed while generating. Try again.')
        return
      }
      if (!result.ok) {
        setMessage(result.reason)
        return
      }
      applyGeneratedNarrativeToForm(form, result.narrative)
    } catch {
      setMessage('Narrative generation could not load the available campaign context. Try again.')
    } finally {
      setPending(false)
    }
  }, [canGenerate, context, draft, form, pending])

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <Text as="h3" variant="muted" className="text-sm">
          Generate a background
        </Text>
        <Text variant="muted" className="text-sm">
          Create aligned traits, ideals, bonds, flaws, and a first-person backstory.
        </Text>
        {message ? (
          <Text variant="destructive" className="text-sm">
            {message}
          </Text>
        ) : null}
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={handleGenerate}
        disabled={!canGenerate || pending}
      >
        {pending ? 'Generating…' : 'Generate background'}
      </Button>
    </div>
  )
}
