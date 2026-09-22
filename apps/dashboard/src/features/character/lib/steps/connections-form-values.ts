import type { CharacterConnections } from '@rpg/contracts'

import { getResidenceConnections } from '../connections/residence-location-connection.lib'
import type { ConnectionsFormValues } from './connections-form-fields'

export function connectionsDraftToFormValues(
  connections: CharacterConnections,
): ConnectionsFormValues {
  return {
    organizations: connections.organizations,
    locations: getResidenceConnections(connections.locations),
  }
}

export function connectionsFormValuesToDraft(
  values: ConnectionsFormValues,
  prior: CharacterConnections,
): CharacterConnections {
  const residenceIds = new Set(values.locations.map((connection) => connection.id))
  const preservedLocations = prior.locations.filter(
    (connection) => connection.kind !== 'resides_at' || residenceIds.has(connection.id),
  )
  const nonResidenceLocations = preservedLocations.filter(
    (connection) => connection.kind !== 'resides_at',
  )

  return {
    organizations: values.organizations,
    locations: [...nonResidenceLocations, ...values.locations],
  }
}

export function areConnectionsDraftsEqual(
  left: CharacterConnections,
  right: CharacterConnections,
): boolean {
  return (
    JSON.stringify(left.organizations) === JSON.stringify(right.organizations) &&
    JSON.stringify(left.locations) === JSON.stringify(right.locations)
  )
}
