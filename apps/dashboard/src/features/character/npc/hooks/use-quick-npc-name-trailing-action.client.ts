'use client'

import * as React from 'react'
import type { UseFormReturn } from 'react-hook-form'

import type { CharacterBuildContext } from '@rpg/contracts'
import type { TrailingFieldActionConfig } from '@rpg/ui/form'

import {
  generateQuickNpcName,
  QUICK_NPC_GENERATE_NAME_LABEL,
  QUICK_NPC_NAME_GENERATION_FAILED,
  resolveQuickNpcNameGenerationSupport,
} from '../lib/quick-npc-name-generation'
import type { QuickNpcAuthoringTabValues } from '../lib/quick-npc-form-fields'

export function useQuickNpcNameTrailingAction({
  speciesId,
  buildContext,
  form,
}: {
  speciesId: string
  buildContext: CharacterBuildContext
  form: UseFormReturn<QuickNpcAuthoringTabValues>
}) {
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const generationSupport = React.useMemo(
    () => resolveQuickNpcNameGenerationSupport({ speciesId, context: buildContext }),
    [buildContext, speciesId],
  )

  const handleGenerate = React.useCallback(async () => {
    if (!speciesId || pending || !generationSupport.enabled) return
    setPending(true)
    setError(null)
    try {
      const result = await generateQuickNpcName({ speciesId, context: buildContext })
      if (!result.ok) {
        setError(result.kind === 'unsupported' ? result.reason : QUICK_NPC_NAME_GENERATION_FAILED)
        return
      }
      form.setValue('name', result.name, { shouldDirty: true, shouldValidate: true })
    } finally {
      setPending(false)
    }
  }, [buildContext, form, generationSupport.enabled, pending, speciesId])

  const trailingAction = React.useMemo(
    (): TrailingFieldActionConfig => ({
      label: QUICK_NPC_GENERATE_NAME_LABEL,
      onAction: handleGenerate,
      disabled: !speciesId || !generationSupport.enabled,
      pending,
      error: error ?? undefined,
    }),
    [error, generationSupport.enabled, handleGenerate, pending, speciesId],
  )

  const nameHint =
    generationSupport.disabledReason && !generationSupport.enabled
      ? generationSupport.disabledReason
      : undefined

  return { trailingAction, nameHint }
}
