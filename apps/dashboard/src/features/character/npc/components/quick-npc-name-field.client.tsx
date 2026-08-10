'use client'

import * as React from 'react'

import type { CharacterBuildContext } from '@rpg/contracts'
import { Button, Text } from '@rpg/ui'
import { FormItems } from '@rpg/ui/form'
import { useFormContext } from 'react-hook-form'

import {
  generateQuickNpcName,
  QUICK_NPC_GENERATE_NAME_LABEL,
  QUICK_NPC_NAME_GENERATION_FAILED,
  resolveQuickNpcNameGenerationSupport,
} from '../lib/quick-npc-name-generation'
import type { QuickNpcAuthoringTabValues } from '../lib/quick-npc-form-fields'

export function QuickNpcNameField({
  speciesId,
  buildContext,
}: {
  speciesId: string
  buildContext: CharacterBuildContext
}) {
  const form = useFormContext<QuickNpcAuthoringTabValues>()
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

  const generateDisabled = !speciesId || pending || !generationSupport.enabled

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <FormItems
            idPrefix="quick-npc-name"
            items={[
              {
                type: 'text',
                name: 'name',
                label: 'Name',
                placeholder: 'Enter a name',
                required: true,
                width: 'full',
              },
            ]}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={generateDisabled}
          title={generationSupport.disabledReason}
          onClick={() => {
            void handleGenerate()
          }}
        >
          {QUICK_NPC_GENERATE_NAME_LABEL}
        </Button>
      </div>
      {generationSupport.disabledReason && !generationSupport.enabled ? (
        <Text variant="muted">{generationSupport.disabledReason}</Text>
      ) : null}
      {error ? (
        <Text variant="destructive" role="alert">
          {error}
        </Text>
      ) : null}
    </div>
  )
}
