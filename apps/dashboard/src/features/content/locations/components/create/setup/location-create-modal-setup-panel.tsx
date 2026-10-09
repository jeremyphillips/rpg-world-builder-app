import {
  CreateSetupPanel,
  type CreateSetupSequenceModel,
  type CreateSetupSet,
  type CreateSetupValueChangeEvent,
} from '@/lib/create-setup'

import { LOCATION_CREATE_SETUP_CHANGE_LABEL } from '../../../lib/create/setup/location-create-setup-chrome.lib'

export function LocationCreateModalSetupPanel({
  sets,
  model,
  onSetupValueChange,
}: {
  sets: CreateSetupSet[]
  model: CreateSetupSequenceModel
  onSetupValueChange: (event: CreateSetupValueChangeEvent) => void
}) {
  return (
    <CreateSetupPanel
      sets={sets}
      model={model}
      onSetupValueChange={onSetupValueChange}
      changeLabel={LOCATION_CREATE_SETUP_CHANGE_LABEL}
    />
  )
}
