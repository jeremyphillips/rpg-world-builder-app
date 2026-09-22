import type { RelationshipFieldAdapter } from '@rpg/ui/form'

import { OrganizationPickerDrawer } from '../../components/connections/picker/organization-picker-drawer'
import type { OrganizationMembershipSelection } from '../../components/connections/picker/organization-picker-drawer.types'
import type {
  CharacterOrganizationMembershipEdge,
  CharacterRelationshipFieldContext,
} from './character-relationship-field-context.types'

export const characterOrganizationMembershipRelationshipAdapter: RelationshipFieldAdapter<
  CharacterOrganizationMembershipEdge,
  OrganizationMembershipSelection,
  CharacterRelationshipFieldContext
> = {
  renderPicker: ({ open, onOpenChange, context, onAdd, items }) => {
    const selectedIds = new Set(items.map((item) => item.organizationId))
    const pickerItems = context.availableOrganizations.map((organization) => ({
      organization,
      selected: selectedIds.has(organization.id),
    }))

    return (
      <OrganizationPickerDrawer
        open={open}
        onOpenChange={onOpenChange}
        items={pickerItems}
        onAdd={onAdd}
      />
    )
  },
  createEdge: (selection) => selection,
  canAdd: (items, context) => {
    const selectedIds = new Set(items.map((item) => item.organizationId))
    return context.availableOrganizations.some((organization) => !selectedIds.has(organization.id))
  },
}
