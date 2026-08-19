'use client'

import { useMemo, useState } from 'react'

import type { CreateSetupExternalDecision, CreateSetupValueChangeEvent } from '@/lib/create-setup'
import { CreateSetupShell, notifyCreateSetupValueChangeCompletion } from '@/lib/create-setup'

import type {
  LocationCreateIntent,
  LocationCreateSetupResult,
} from '../lib/location-create-session'
import {
  applyLocationCreateModalSetupValueChange,
  EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES,
  resolveLocationCreateModalSetupModel,
  isLocationCreateModalSetupComplete,
  type LocationCreateModalSetupValues,
} from '../lib/location-create-modal-setup.lib'
import { LOCATION_CREATE_SETUP_CHANGE_LABEL } from '../lib/location-create-setup-chrome.lib'
import { buildLocationCreateSetupSets } from '../lib/location-create-setup.lib'

const LOCATION_SETUP_NAVIGATION_DECISION_ID = 'locationSetupNavigation' as const

function resolveLocationSetupNavigationExternalDecision(args: {
  values: LocationCreateModalSetupValues
  isReady: boolean
}): CreateSetupExternalDecision {
  return {
    id: LOCATION_SETUP_NAVIGATION_DECISION_ID,
    isResolved: args.isReady,
    completion: 'explicit',
    revision: JSON.stringify(args.values),
    completeLabel: 'Continue',
  }
}

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
  const sets = useMemo(() => (model ? buildLocationCreateSetupSets(model.choiceSets) : []), [model])
  const externalDecisions = useMemo(
    () =>
      model
        ? [
            resolveLocationSetupNavigationExternalDecision({
              values,
              isReady: isLocationCreateModalSetupComplete(model),
            }),
          ]
        : [],
    [model, values],
  )

  if (!model) {
    throw new Error(
      `Unsupported location create setup authoring type: ${String(intent.authoringType)}`,
    )
  }

  const handleContinue = () => {
    const currentModel = resolveLocationCreateModalSetupModel({ intent, values })
    const result = currentModel?.complete()
    if (!result) return
    onComplete(result)
  }

  const handleSetupValueChange = (event: CreateSetupValueChangeEvent) => {
    const previousModel = resolveLocationCreateModalSetupModel({ intent, values })
    const previousSets = previousModel ? buildLocationCreateSetupSets(previousModel.choiceSets) : []

    const nextValues = applyLocationCreateModalSetupValueChange({
      values,
      event,
    })
    const nextModel = resolveLocationCreateModalSetupModel({ intent, values: nextValues })
    const nextSets = nextModel ? buildLocationCreateSetupSets(nextModel.choiceSets) : []
    const nextExternalDecisions = nextModel
      ? [
          resolveLocationSetupNavigationExternalDecision({
            values: nextValues,
            isReady: isLocationCreateModalSetupComplete(nextModel),
          }),
        ]
      : []

    notifyCreateSetupValueChangeCompletion({
      previousSets,
      nextSets,
      externalDecisions: nextExternalDecisions,
      onSetupComplete: () => {
        const result = nextModel?.complete()
        if (!result) return
        onComplete(result)
      },
    })

    setValues(nextValues)
  }

  return (
    <CreateSetupShell
      open={open}
      onOpenChange={onOpenChange}
      headline={model.headline}
      subhead={model.subhead}
      sets={sets}
      changeLabel={LOCATION_CREATE_SETUP_CHANGE_LABEL}
      externalDecisions={externalDecisions}
      onSetupValueChange={handleSetupValueChange}
      onContinue={handleContinue}
    />
  )
}
