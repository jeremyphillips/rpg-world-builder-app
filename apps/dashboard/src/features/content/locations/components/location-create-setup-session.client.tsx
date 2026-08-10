'use client'

import { useState } from 'react'

import type {
  LocationCreateIntent,
  LocationCreateSetupResult,
} from '../lib/location-create-session'
import {
  applyLocationCreateModalSetupValueChange,
  EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES,
  resolveLocationCreateModalSetupModel,
  type LocationCreateModalSetupValues,
} from '../lib/location-create-modal-setup.lib'
import { LOCATION_CREATE_SETUP_CHANGE_LABEL } from '../lib/location-create-setup-chrome.lib'
import { buildLocationCreateSetupSets } from '../lib/location-create-setup.lib'
import { CreateSetupShell } from '@/lib/create-setup'

export type LocationCreateSetupSessionProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  intent: LocationCreateIntent
  onComplete: (result: LocationCreateSetupResult) => void
}

/**
 * Page/overview create-setup session — same choice-set model + value applicator as
 * `LocationCreateModal` setup phase (SSOT: `location-create-modal-setup.lib`).
 */
export function LocationCreateSetupSession({
  open,
  onOpenChange,
  intent,
  onComplete,
}: LocationCreateSetupSessionProps) {
  const [values, setValues] = useState<LocationCreateModalSetupValues>(() => ({
    ...EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES,
  }))

  const model = resolveLocationCreateModalSetupModel({ intent, values })
  if (!model) {
    throw new Error(
      `Unsupported location create setup authoring type: ${String(intent.authoringType)}`,
    )
  }

  const choiceSets = model.choiceSets.map((choiceSet) => ({
    ...choiceSet,
    onValueChange: (nextValue: string) => {
      setValues((current) =>
        applyLocationCreateModalSetupValueChange({
          values: current,
          choiceSetId: choiceSet.id,
          nextValue,
        }),
      )
    },
  }))

  return (
    <CreateSetupShell
      open={open}
      onOpenChange={onOpenChange}
      headline={model.headline}
      subhead={model.subhead}
      sets={buildLocationCreateSetupSets(choiceSets)}
      changeLabel={LOCATION_CREATE_SETUP_CHANGE_LABEL}
      additionalContinueConstraint={model.canContinue}
      onContinue={() => {
        const result = model.complete()
        if (!result) return
        onComplete(result)
      }}
    />
  )
}
