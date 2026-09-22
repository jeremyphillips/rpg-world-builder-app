import { useEffect, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import type { CharacterBuilderDraft, CharacterConnections } from '@rpg/contracts'

import type { ConnectionsFormValues } from '../../../../lib/steps/connections-form-fields'
import {
  areConnectionsDraftsEqual,
  connectionsDraftToFormValues,
  connectionsFormValuesToDraft,
} from '../../../../lib/steps/connections-form-values'

type ConnectionsDraftSyncProps = {
  draftConnections: CharacterConnections
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

/** Keeps connections form state and the persisted builder draft in sync (both directions). */
export function ConnectionsDraftSync({
  draftConnections,
  onDraftChange,
}: ConnectionsDraftSyncProps) {
  const { control, reset } = useFormContext<ConnectionsFormValues>()
  const organizations = useWatch({ control, name: 'organizations' })
  const locations = useWatch({ control, name: 'locations' })
  const onDraftChangeRef = useRef(onDraftChange)
  const priorDraftRef = useRef(draftConnections)

  useEffect(() => {
    onDraftChangeRef.current = onDraftChange
  })

  useEffect(() => {
    const previousDraft = priorDraftRef.current
    const draftChanged = !areConnectionsDraftsEqual(previousDraft, draftConnections)
    const formConnections = connectionsFormValuesToDraft(
      {
        organizations: organizations ?? [],
        locations: locations ?? [],
      },
      draftConnections,
    )

    if (draftChanged) {
      priorDraftRef.current = draftConnections
      if (!areConnectionsDraftsEqual(draftConnections, formConnections)) {
        reset(connectionsDraftToFormValues(draftConnections))
      }
      return
    }

    if (!areConnectionsDraftsEqual(draftConnections, formConnections)) {
      onDraftChangeRef.current({ connections: formConnections })
    }
  }, [draftConnections, locations, organizations, reset])

  return null
}
