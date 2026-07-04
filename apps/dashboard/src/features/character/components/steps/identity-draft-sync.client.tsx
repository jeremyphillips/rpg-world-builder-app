'use client'

import { useEffect, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import type { CharacterBuilderDraft, CharacterBuilderDraftIdentity } from '@rpg/contracts'

import type { IdentityFormValues } from '../../lib/steps/identity-form-fields'
import {
  areIdentityDraftsEqual,
  identityFormValuesToDraft,
} from '../../lib/steps/identity-form-values'

type IdentityDraftSyncProps = {
  draftIdentity: CharacterBuilderDraftIdentity
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

/** Mirrors identity form edits into the persisted builder draft while the user types. */
export function IdentityDraftSync({ draftIdentity, onDraftChange }: IdentityDraftSyncProps) {
  const { control } = useFormContext<IdentityFormValues>()
  const name = useWatch({ control, name: 'name' })
  const description = useWatch({ control, name: 'description' })
  const alignment = useWatch({ control, name: 'alignment' })
  const onDraftChangeRef = useRef(onDraftChange)

  onDraftChangeRef.current = onDraftChange

  useEffect(() => {
    const nextIdentity = identityFormValuesToDraft({
      name: name ?? '',
      description,
      alignment,
    })

    if (areIdentityDraftsEqual(draftIdentity, nextIdentity)) {
      return
    }

    onDraftChangeRef.current({ identity: nextIdentity })
  }, [alignment, description, draftIdentity, name])

  return null
}
