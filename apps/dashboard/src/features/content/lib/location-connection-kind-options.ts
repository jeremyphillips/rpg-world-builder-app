import type {
  CharacterLocationConnectionKind,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import {
  CHARACTER_LOCATION_CONNECTION_ENTRIES,
  getCharacterLocationConnectionLabel,
  getOrganizationLocationConnectionLabel,
  ORGANIZATION_LOCATION_CONNECTION_ENTRIES,
} from '@rpg/contracts'

import { LOCATION_CONNECTION_KIND_ALREADY_LINKED_REASON } from './location-connection-drawer-intent'

export type LocationConnectionKindOption = {
  value: string
  label: string
  description: string
  disabled?: boolean
  disabledReason?: string
}

export const LOCATION_CONNECTION_KIND_FIELD_LABEL = 'Connection type'

/** @deprecated Use LOCATION_CONNECTION_KIND_ALREADY_LINKED_REASON from drawer-intent module. */
export const LOCATION_CONNECTION_ALREADY_LINKED_REASON = 'Already linked with this connection type.'

export function buildOrganizationLocationConnectionKindOptions(
  kinds: readonly OrganizationLocationConnectionKind[],
  disabledKinds: ReadonlySet<OrganizationLocationConnectionKind> = new Set(),
): LocationConnectionKindOption[] {
  return kinds.map((kind) => ({
    value: kind,
    label: getOrganizationLocationConnectionLabel(kind),
    description: ORGANIZATION_LOCATION_CONNECTION_ENTRIES[kind].description,
    disabled: disabledKinds.has(kind),
    disabledReason: disabledKinds.has(kind)
      ? LOCATION_CONNECTION_KIND_ALREADY_LINKED_REASON
      : undefined,
  }))
}

export function buildCharacterLocationConnectionKindOptions(
  kinds: readonly CharacterLocationConnectionKind[],
  disabledKinds: ReadonlySet<CharacterLocationConnectionKind> = new Set(),
): LocationConnectionKindOption[] {
  return kinds.map((kind) => ({
    value: kind,
    label: getCharacterLocationConnectionLabel(kind),
    description: CHARACTER_LOCATION_CONNECTION_ENTRIES[kind].description,
    disabled: disabledKinds.has(kind),
    disabledReason: disabledKinds.has(kind)
      ? LOCATION_CONNECTION_KIND_ALREADY_LINKED_REASON
      : undefined,
  }))
}

export function resolveActiveConnectionKind(
  selectedKind: string | null,
  kindOptions: readonly LocationConnectionKindOption[],
): string | null {
  const enabledOptions = kindOptions.filter((option) => !option.disabled)
  if (enabledOptions.length === 1) {
    return enabledOptions[0]?.value ?? null
  }

  if (
    selectedKind &&
    kindOptions.some((option) => option.value === selectedKind && !option.disabled)
  ) {
    return selectedKind
  }

  return null
}
