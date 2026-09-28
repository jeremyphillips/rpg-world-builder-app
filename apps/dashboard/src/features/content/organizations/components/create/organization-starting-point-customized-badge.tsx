import { useWatch } from 'react-hook-form'
import type { CharacterClass } from '@rpg/contracts'
import { Badge } from '@rpg/ui'

import { ORGANIZATION_STARTING_POINT_CUSTOMIZED_LABEL } from '../../lib/presets/organization-form-copy.lib'
import {
  isOrganizationAuthoringPresetId,
  organizationStartingPointFieldPath,
  organizationStartingPointIsCustomized,
} from '../../lib/presets/organization-starting-point.lib'

export type OrganizationStartingPointCustomizedBadgeProps = {
  prefix?: string
  discoverableClasses: readonly CharacterClass[]
}

/** Value-derived status for the Starting point group legend — not form dirty state. */
export function OrganizationStartingPointCustomizedBadge({
  prefix,
  discoverableClasses,
}: OrganizationStartingPointCustomizedBadgeProps) {
  const startingPointId = useWatch({ name: organizationStartingPointFieldPath(prefix) })
  const values = useWatch() as Record<string, unknown>

  const applied = isOrganizationAuthoringPresetId(startingPointId)
  const customized =
    applied && organizationStartingPointIsCustomized(values, { prefix, discoverableClasses })

  if (!customized) {
    return null
  }

  return (
    <Badge tone="neutral" size="sm" appearance="soft" aria-hidden className="shrink-0">
      {ORGANIZATION_STARTING_POINT_CUSTOMIZED_LABEL}
    </Badge>
  )
}
