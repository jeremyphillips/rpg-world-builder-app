import { useEffect, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import type { CharacterBuilderDraft, CharacterRelationshipDraftEdges } from '@rpg/contracts'

import type { ConnectionsFormValues } from '../../../../lib/steps/connections-form-fields'
import {
  areConnectionsDraftsEqual,
  connectionsDraftToFormValues,
  connectionsFormValuesToDraft,
} from '../../../../lib/steps/connections-form-values'

type ConnectionsDraftSyncProps = {
  draftRelationshipEdges: CharacterRelationshipDraftEdges
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

/** Keeps connections form state and the persisted builder draft in sync (both directions). */
export function ConnectionsDraftSync({
  draftRelationshipEdges,
  onDraftChange,
}: ConnectionsDraftSyncProps) {
  const { control, reset } = useFormContext<ConnectionsFormValues>()
  const organizations = useWatch({ control, name: 'organizations' })
  const locations = useWatch({ control, name: 'locations' })
  const onDraftChangeRef = useRef(onDraftChange)
  const priorDraftRef = useRef(draftRelationshipEdges)

  useEffect(() => {
    onDraftChangeRef.current = onDraftChange
  })

  useEffect(() => {
    const previousDraft = priorDraftRef.current
    const draftChanged = !areConnectionsDraftsEqual(previousDraft, draftRelationshipEdges)
    const formEdges = connectionsFormValuesToDraft(
      {
        organizations: organizations ?? [],
        locations: locations ?? [],
      },
      draftRelationshipEdges,
    )

    if (draftChanged) {
      priorDraftRef.current = draftRelationshipEdges
      if (!areConnectionsDraftsEqual(draftRelationshipEdges, formEdges)) {
        reset(connectionsDraftToFormValues(draftRelationshipEdges))
      }
      return
    }

    if (!areConnectionsDraftsEqual(draftRelationshipEdges, formEdges)) {
      onDraftChangeRef.current({ relationshipEdges: formEdges })
    }
  }, [draftRelationshipEdges, locations, organizations, reset])

  return null
}
