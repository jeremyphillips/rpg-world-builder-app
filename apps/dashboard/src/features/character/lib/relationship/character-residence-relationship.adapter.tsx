import type { RelationshipFieldAdapter } from '@rpg/ui/form'

import { ResidenceLocationPickerDrawer } from '../../components/connections/picker/residence-location-picker-drawer'
import type { ResidenceLocationSelection } from '../../components/connections/picker/residence-location-picker-drawer.types'
import {
  createApiResidenceRow,
  createDraftResidenceRow,
} from './character-relationship-form-rows.lib'
import type {
  CharacterRelationshipFieldContext,
  CharacterResidenceEdge,
} from './character-relationship-field-context.types'

function resolveResidenceLocationId(edge: CharacterResidenceEdge): string {
  return 'connection' in edge ? edge.connection.locationId : edge.locationId
}

export const characterResidenceRelationshipAdapter: RelationshipFieldAdapter<
  CharacterResidenceEdge,
  ResidenceLocationSelection,
  CharacterRelationshipFieldContext
> = {
  renderPicker: ({ open, onOpenChange, context, onAdd, items }) => {
    const selectedIds = new Set(items.map((item) => resolveResidenceLocationId(item)))
    const pickerItems = context.eligibleResidenceLocations.map((location) => ({
      location,
      selected: selectedIds.has(location.id),
    }))

    return (
      <ResidenceLocationPickerDrawer
        open={open}
        onOpenChange={onOpenChange}
        items={pickerItems}
        onAdd={onAdd}
      />
    )
  },
  createEdge: (selection, _items, context) =>
    context.mode === 'api'
      ? createApiResidenceRow(selection.locationId)
      : createDraftResidenceRow(selection.locationId),
  canAdd: (items, context) => {
    if (!context.campaignId) return false
    const selectedIds = new Set(items.map((item) => resolveResidenceLocationId(item)))
    return context.eligibleResidenceLocations.some((location) => !selectedIds.has(location.id))
  },
}
