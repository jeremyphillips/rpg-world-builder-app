import {
  CONTENT_ACCESS_CAPABILITIES,
  CONTENT_VISIBILITY_MODE_ENTRIES,
  type ContentAccessTargetType,
  type ContentVisibilityMode,
} from '@rpg/contracts'

export type BuildCampaignAccessAvailabilityOptionsInput = {
  includeLeaveUnchanged?: boolean
}

export function buildCampaignAccessAvailabilityOptions(
  input: BuildCampaignAccessAvailabilityOptionsInput = {},
) {
  const options = [
    { value: 'true', label: 'Available' },
    { value: 'false', label: 'Unavailable' },
  ]

  if (input.includeLeaveUnchanged) {
    return [{ value: 'unchanged', label: 'Leave unchanged' }, ...options]
  }

  return options
}

export type BuildCampaignAccessVisibilityOptionsInput = {
  includeSpecificPlayers?: boolean
  includeLeaveUnchanged?: boolean
}

export function buildCampaignAccessVisibilityOptions(
  targetType: ContentAccessTargetType,
  input: BuildCampaignAccessVisibilityOptionsInput = {},
) {
  const capability = CONTENT_ACCESS_CAPABILITIES[targetType]
  if (capability.mode !== 'owned') return []

  const modes = capability.visibilityModes.filter(
    (mode) => input.includeSpecificPlayers !== false || mode !== 'specific_players',
  )

  const options = modes.map((mode) => ({
    value: mode,
    label: CONTENT_VISIBILITY_MODE_ENTRIES[mode].label,
  }))

  if (input.includeLeaveUnchanged) {
    return [{ value: 'unchanged', label: 'Leave unchanged' }, ...options]
  }

  return options
}

export function parseBulkAvailabilityOption(
  value: string,
): { kind: 'unchanged' } | { kind: 'set'; value: boolean } {
  if (value === 'unchanged') return { kind: 'unchanged' }
  return { kind: 'set', value: value === 'true' }
}

export function parseBulkVisibilityOption(
  value: string,
): { kind: 'unchanged' } | { kind: 'set'; value: ContentVisibilityMode } {
  if (value === 'unchanged') return { kind: 'unchanged' }
  return { kind: 'set', value: value as ContentVisibilityMode }
}

export function formatBulkAvailabilityOption(
  operation: { kind: 'unchanged' } | { kind: 'set'; value: boolean },
): string {
  if (operation.kind === 'unchanged') return 'unchanged'
  return operation.value ? 'true' : 'false'
}

export function formatBulkVisibilityOption(
  operation: { kind: 'unchanged' } | { kind: 'set'; value: ContentVisibilityMode },
): string {
  if (operation.kind === 'unchanged') return 'unchanged'
  return operation.value
}
