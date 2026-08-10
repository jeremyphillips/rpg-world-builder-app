'use client'

import * as React from 'react'

import type { CharacterBuildContext } from '@rpg/contracts'
import { Button, Text } from '@rpg/ui'
import { FormItems } from '@rpg/ui/form'

import {
  generateQuickNpcName,
  QUICK_NPC_GENERATE_NAME_LABEL,
  QUICK_NPC_NAME_GENERATION_FAILED,
} from '../lib/quick-npc-name-generation'

export function QuickNpcNameField({
  speciesId,
  buildContext,
  onNameGenerated,
}: {
  speciesId: string
  buildContext: CharacterBuildContext
  onNameGenerated: (name: string) => void
}) {
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleGenerate = React.useCallback(async () => {
    if (!speciesId || pending) return
    setPending(true)
    setError(null)
    try {
      const name = await generateQuickNpcName({ speciesId, context: buildContext })
      if (!name) {
        setError(QUICK_NPC_NAME_GENERATION_FAILED)
        return
      }
      onNameGenerated(name)
    } finally {
      setPending(false)
    }
  }, [buildContext, onNameGenerated, pending, speciesId])

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
          disabled={!speciesId || pending}
          onClick={() => {
            void handleGenerate()
          }}
        >
          {QUICK_NPC_GENERATE_NAME_LABEL}
        </Button>
      </div>
      {error ? (
        <Text variant="destructive" role="alert">
          {error}
        </Text>
      ) : null}
    </div>
  )
}
