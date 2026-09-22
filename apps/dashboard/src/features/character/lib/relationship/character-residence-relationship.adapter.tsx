import { Text } from '@rpg/ui'
import type { RelationshipFieldAdapter } from '@rpg/ui/form'

import { ResidenceLocationPickerDrawer } from '../../components/connections/picker/residence-location-picker-drawer'
import type { ResidenceLocationSelection } from '../../components/connections/picker/residence-location-picker-drawer.types'
import { createResidenceLocationConnection } from '../connections/residence-location-connection.lib'
import type {
  CharacterRelationshipFieldContext,
  CharacterResidenceEdge,
} from './character-relationship-field-context.types'
import { resolveResidenceSectionStatusCopy } from './character-residence-can-append.lib'

export const characterResidenceRelationshipAdapter: RelationshipFieldAdapter<
  CharacterResidenceEdge,
  ResidenceLocationSelection,
  CharacterRelationshipFieldContext
> = {
  getItemKey: (edge) => ('connection' in edge ? edge.connection.id : edge.id),
  listAriaLabel: 'Selected residences',
  supplementary: (context) => {
    const copy = resolveResidenceSectionStatusCopy(context)
    return copy ? (
      <Text variant="muted" className="text-sm">
        {copy}
      </Text>
    ) : null
  },
  projectRow: (edge) => ({
    key: 'connection' in edge ? edge.connection.id : edge.id,
    content: null,
  }),
  renderPicker: ({ open, onOpenChange, context, onAdd, items }) => {
    const selectedIds = new Set(
      items.map((item) => ('connection' in item ? item.connection.locationId : item.locationId)),
    )
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
  createEdge: (selection) => createResidenceLocationConnection(selection.locationId),
  canAdd: (items, context) => {
    if (!context.campaignId) return false
    const selectedIds = new Set(
      items.map((item) => ('connection' in item ? item.connection.locationId : item.locationId)),
    )
    return context.eligibleResidenceLocations.some((location) => !selectedIds.has(location.id))
  },
}
