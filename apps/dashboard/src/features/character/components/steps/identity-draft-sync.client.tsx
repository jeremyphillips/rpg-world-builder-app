'use client'

import { useEffect, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import type { CharacterBuilderDraft, CharacterBuilderDraftIdentity } from '@rpg/contracts'

import type { IdentityFormValues } from '../../lib/steps/identity-form-fields'
import {
  areIdentityDraftsEqual,
  emptyNarrativeFormValues,
  identityDraftToFormValues,
  identityFormValuesToDraft,
} from '../../lib/steps/identity-form-values'

type IdentityDraftSyncProps = {
  draftIdentity: CharacterBuilderDraftIdentity
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

/** Keeps identity form state and the persisted builder draft in sync (both directions). */
export function IdentityDraftSync({ draftIdentity, onDraftChange }: IdentityDraftSyncProps) {
  const { control, reset } = useFormContext<IdentityFormValues>()
  const name = useWatch({ control, name: 'name' })
  const narrative = useWatch({ control, name: 'narrative' })
  const alignment = useWatch({ control, name: 'alignment' })
  const onDraftChangeRef = useRef(onDraftChange)
  const priorDraftRef = useRef(draftIdentity)

  useEffect(() => {
    onDraftChangeRef.current = onDraftChange
  })

  useEffect(() => {
    const previousDraft = priorDraftRef.current
    const draftChanged = !areIdentityDraftsEqual(previousDraft, draftIdentity)
    const formIdentity = identityFormValuesToDraft({
      name: name ?? '',
      narrative: narrative ?? emptyNarrativeFormValues(),
      alignment,
    })

    if (draftChanged) {
      priorDraftRef.current = draftIdentity
      if (!areIdentityDraftsEqual(draftIdentity, formIdentity)) {
        reset(identityDraftToFormValues(draftIdentity))
      }
      return
    }

    if (!areIdentityDraftsEqual(draftIdentity, formIdentity)) {
      onDraftChangeRef.current({ identity: formIdentity })
    }
  }, [alignment, draftIdentity, name, narrative, reset])

  return null
}
