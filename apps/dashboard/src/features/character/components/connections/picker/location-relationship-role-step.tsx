import { Chip, ChipGroup, Text } from '@rpg/ui'

import type {
  PlaceConnectionRoleOption,
  PropertyConnectionRoleOption,
} from '../../../lib/relationship/connection-role-catalog'

type LocationRelationshipRoleOption = PlaceConnectionRoleOption | PropertyConnectionRoleOption

export type LocationRelationshipRoleStepProps = {
  roleOptions: readonly LocationRelationshipRoleOption[]
  selectedRoleId: string | null
  onSelectedRoleIdChange: (roleId: string | null) => void
}

export function LocationRelationshipRoleStep({
  roleOptions,
  selectedRoleId,
  onSelectedRoleIdChange,
}: LocationRelationshipRoleStepProps) {
  return (
    <div className="space-y-2">
      <Text>How is this location connected?</Text>
      <ChipGroup semanticRole="radiogroup" aria-label="Location relationship">
        {roleOptions.map((role) => (
          <Chip
            key={role.id}
            id={`location-role-${role.id}`}
            mode="selectable"
            selectionRole="radio"
            selected={selectedRoleId === role.id}
            onSelectedChange={(selected) => {
              onSelectedRoleIdChange(selected ? role.id : null)
            }}
          >
            {role.label}
          </Chip>
        ))}
      </ChipGroup>
    </div>
  )
}
