import {
  getCharacterRelationshipEdgeKindDisplayLabel,
  type CharacterRelationshipProjectionRow,
} from '@rpg/contracts'

import {
  PERSON_CONNECTION_ROLE_OPTIONS,
  PLACE_CONNECTION_ROLE_OPTIONS,
  PROPERTY_CONNECTION_ROLE_OPTIONS,
  type PersonConnectionRoleOption,
  type PlaceConnectionRoleOption,
  type PropertyConnectionRoleOption,
} from './connection-role-catalog'
import { getConnectionTopLevelSectionForKind } from './connection-section-catalog'

function resolveDirectedPersonRoleOption(
  row: CharacterRelationshipProjectionRow,
): PersonConnectionRoleOption | undefined {
  const options = PERSON_CONNECTION_ROLE_OPTIONS.filter((option) => option.kind === row.kind)
  if (options.length <= 1) return options[0]

  const forwardLabel = getCharacterRelationshipEdgeKindDisplayLabel(row.kind, 'forward')
  const inverseLabel = getCharacterRelationshipEdgeKindDisplayLabel(row.kind, 'inverse')

  if (row.roleLabel === forwardLabel) {
    return options.find(
      (option) => option.directedRole === 'child' || option.directedRole === 'student',
    )
  }

  if (row.roleLabel === inverseLabel) {
    return options.find(
      (option) => option.directedRole === 'parent' || option.directedRole === 'mentor',
    )
  }

  return options.find((option) => option.label === row.roleLabel) ?? options[0]
}

export function resolvePersonRoleOptionFromProjection(
  row: CharacterRelationshipProjectionRow,
): PersonConnectionRoleOption | undefined {
  if (getConnectionTopLevelSectionForKind(row.kind) !== 'people') return undefined
  return resolveDirectedPersonRoleOption(row)
}

export function resolvePlaceRoleOptionFromProjection(
  row: CharacterRelationshipProjectionRow,
): PlaceConnectionRoleOption | undefined {
  return PLACE_CONNECTION_ROLE_OPTIONS.find((option) => option.kind === row.kind)
}

export function resolvePropertyRoleOptionFromProjection(
  row: CharacterRelationshipProjectionRow,
): PropertyConnectionRoleOption | undefined {
  return PROPERTY_CONNECTION_ROLE_OPTIONS.find((option) => option.kind === row.kind)
}
