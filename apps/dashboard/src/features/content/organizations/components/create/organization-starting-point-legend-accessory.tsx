import type { CharacterClass } from '@rpg/contracts'

import { OrganizationStartingPointCustomizedBadge } from './organization-starting-point-customized-badge'

export type OrganizationStartingPointLegendAccessoryProps = {
  prefix?: string
  discoverableClasses: readonly CharacterClass[]
}

export function OrganizationStartingPointLegendAccessory({
  prefix,
  discoverableClasses,
}: OrganizationStartingPointLegendAccessoryProps) {
  return (
    <OrganizationStartingPointCustomizedBadge
      prefix={prefix}
      discoverableClasses={discoverableClasses}
    />
  )
}
