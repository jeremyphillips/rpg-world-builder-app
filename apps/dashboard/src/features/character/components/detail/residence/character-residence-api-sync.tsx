import { useEffect, useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import type { CharacterLocationReferenceResolution } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import type { ResidenceLocationSelection } from '../../connections/picker/residence-location-picker-drawer.types'
import {
  areResidenceListsEqual,
  residencesToFormValues,
  type ResidenceFormValues,
} from '../../../lib/relationship/character-residence-form-fields'

type CharacterResidenceApiSyncProps = {
  serverResidences: readonly CharacterLocationReferenceResolution[]
  onAdd: (selection: ResidenceLocationSelection) => void | Promise<void>
  onRemove: (connectionId: string, locationId: string) => void | Promise<void>
}

/** Commits residence array edits from RHF to the API sheet handlers. */
export function CharacterResidenceApiSync({
  serverResidences,
  onAdd,
  onRemove,
}: CharacterResidenceApiSyncProps) {
  const { control, reset } = useFormContext<ResidenceFormValues>()
  const formLocations = useWatch({ control, name: 'locations' })
  const onAddRef = useRef(onAdd)
  const onRemoveRef = useRef(onRemove)
  const priorServerRef = useRef(serverResidences)
  const syncInFlightRef = useRef(false)
  const [removeError, setRemoveError] = useState<string>()

  useEffect(() => {
    onAddRef.current = onAdd
    onRemoveRef.current = onRemove
  })

  useEffect(() => {
    if (syncInFlightRef.current) return

    const serverChanged = !areResidenceListsEqual(priorServerRef.current, serverResidences)
    if (serverChanged) {
      priorServerRef.current = serverResidences
      reset(residencesToFormValues(serverResidences))
      setRemoveError(undefined)
      return
    }

    const formValues: ResidenceFormValues = { locations: formLocations ?? [] }
    const serverSnapshot = residencesToFormValues(serverResidences)
    if (JSON.stringify(formValues.locations) === JSON.stringify(serverSnapshot.locations)) {
      return
    }

    const serverByLocationId = new Map(
      serverResidences.map((reference) => [reference.connection.locationId, reference.connection]),
    )
    const formLocationIds = new Set(formValues.locations.map((connection) => connection.locationId))
    const serverLocationIds = new Set(serverByLocationId.keys())

    const toRemove = serverResidences.filter(
      (reference) => !formLocationIds.has(reference.connection.locationId),
    )
    const toAdd = formValues.locations.filter(
      (connection) => !serverLocationIds.has(connection.locationId),
    )

    if (toRemove.length === 0 && toAdd.length === 0) return

    syncInFlightRef.current = true
    setRemoveError(undefined)

    void (async () => {
      try {
        for (const reference of toRemove) {
          await onRemoveRef.current(reference.connection.id, reference.connection.locationId)
        }
        for (const connection of toAdd) {
          await onAddRef.current({
            locationId: connection.locationId,
          })
        }
      } catch (error) {
        const message =
          error instanceof Error && error.message.trim().length > 0
            ? error.message
            : 'Could not update this residence.'
        setRemoveError(message)
        reset(residencesToFormValues(serverResidences))
      } finally {
        syncInFlightRef.current = false
      }
    })()
  }, [formLocations, reset, serverResidences])

  if (!removeError) return null

  return (
    <Text variant="destructive" className="text-sm" aria-live="polite">
      {removeError}
    </Text>
  )
}
