'use client'

import {
  useCreateSetupSequence,
  CreateSetupPanel,
  type CreateSetupSet,
  type CreateSetupValueChangeEvent,
} from '@/lib/create-setup'

import { LOCATION_CREATE_SETUP_CHANGE_LABEL } from '../lib/location-create-setup-chrome.lib'

export function LocationCreateModalSetupPanel({
  sets,
  canContinue,
  onSetupValueChange,
}: {
  sets: CreateSetupSet[]
  canContinue: boolean
  onSetupValueChange: (event: CreateSetupValueChangeEvent) => void
}) {
  const model = useCreateSetupSequence(sets, { additionalContinueConstraint: canContinue })

  return (
    <CreateSetupPanel
      sets={sets}
      model={model}
      onSetupValueChange={onSetupValueChange}
      changeLabel={LOCATION_CREATE_SETUP_CHANGE_LABEL}
    />
  )
}
