import type { CatalogPickerAuxiliaryAction } from '@rpg/ui'

import type { LocationAuthoringType } from '../../locations/lib/location-authoring-type'
import { getLocationAuthoringTypeLabel } from '../../locations/lib/location-create-shortcuts'
import {
  RELATIONSHIP_PICKER_CREATE_MENU_LABEL,
  type RelationshipPickerCreateIntent,
} from './relationship-picker-create-intents.lib'

export type RelationshipPickerCreateIntentHandlers = {
  onOrganization: () => void
  onLocation: (authoringType: LocationAuthoringType) => void
  disabled?: boolean
}

/** Maps domain create intents onto the generic picker auxiliary slot. */
export function mapRelationshipPickerCreateIntentsToAuxiliaryAction(
  intents: readonly RelationshipPickerCreateIntent[],
  handlers: RelationshipPickerCreateIntentHandlers,
): CatalogPickerAuxiliaryAction | undefined {
  if (intents.length === 0) {
    return undefined
  }

  const disabled = handlers.disabled ?? false

  if (intents.length === 1) {
    const intent = intents[0]!
    return {
      state: 'action',
      label: intent.label,
      disabled,
      onAction: () => {
        if (intent.target === 'organization') {
          handlers.onOrganization()
          return
        }
        handlers.onLocation(intent.authoringType)
      },
    }
  }

  return {
    state: 'menu',
    label: RELATIONSHIP_PICKER_CREATE_MENU_LABEL,
    disabled,
    items: intents.map((intent) => ({
      label:
        intent.target === 'organization'
          ? intent.label
          : getLocationAuthoringTypeLabel(intent.authoringType),
      onAction: () => {
        if (intent.target === 'organization') {
          handlers.onOrganization()
          return
        }
        handlers.onLocation(intent.authoringType)
      },
    })),
  }
}
