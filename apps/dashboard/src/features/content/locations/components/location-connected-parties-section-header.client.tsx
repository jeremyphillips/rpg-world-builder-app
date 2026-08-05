'use client'

import type { LocationConnectedPartySectionGroup } from '@rpg/contracts'
import { Button, Heading, Text } from '@rpg/ui'

import type { LocationInverseOrganizationAddAffordance } from '../../lib/location-connection-drawer-intent'
import {
  LOCATION_CONNECTED_PARTIES_EMPTY_TEXT,
  LOCATION_CONNECTED_PARTIES_SECTION_HELPERS,
  LOCATION_CONNECTED_PARTIES_SECTION_LABELS,
} from './location-connected-parties-section.client'

type LocationConnectedPartiesSectionHeaderProps = {
  sectionGroup: LocationConnectedPartySectionGroup
  canManage: boolean
  hasRows: boolean
  organizationAddAffordances?: readonly LocationInverseOrganizationAddAffordance[]
  onAddOrganization?: (intent: LocationInverseOrganizationAddAffordance['intent']) => void
  onAddCharacter?: () => void
}

function LocationConnectedPartiesAddActions({
  organizationAddAffordances,
  onAddOrganization,
  onAddCharacter,
}: {
  organizationAddAffordances: readonly LocationInverseOrganizationAddAffordance[]
  onAddOrganization: (intent: LocationInverseOrganizationAddAffordance['intent']) => void
  onAddCharacter?: () => void
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      {organizationAddAffordances.map((affordance) => (
        <Button
          key={affordance.intent}
          type="button"
          variant="outline"
          onClick={() => onAddOrganization(affordance.intent)}
        >
          {affordance.label}
        </Button>
      ))}
      {onAddCharacter ? (
        <Button type="button" variant="outline" onClick={onAddCharacter}>
          Link character
        </Button>
      ) : null}
    </div>
  )
}

// fallow-ignore-next-line complexity
export function LocationConnectedPartiesSectionHeader({
  sectionGroup,
  canManage,
  hasRows,
  organizationAddAffordances = [],
  onAddOrganization,
  onAddCharacter,
}: LocationConnectedPartiesSectionHeaderProps) {
  const showOrganizationAdds =
    canManage &&
    sectionGroup === 'people_and_organizations' &&
    organizationAddAffordances.length > 0 &&
    onAddOrganization
  const showAddCharacter =
    canManage && sectionGroup === 'people_and_organizations' && onAddCharacter

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Heading
            variant="label"
            as="h2"
            id={`location-connected-parties-${sectionGroup}-heading`}
          >
            {LOCATION_CONNECTED_PARTIES_SECTION_LABELS[sectionGroup]}
          </Heading>
          {canManage ? (
            <Text variant="muted">{LOCATION_CONNECTED_PARTIES_SECTION_HELPERS[sectionGroup]}</Text>
          ) : null}
        </div>
        {showOrganizationAdds || showAddCharacter ? (
          <LocationConnectedPartiesAddActions
            organizationAddAffordances={showOrganizationAdds ? organizationAddAffordances : []}
            onAddOrganization={onAddOrganization!}
            onAddCharacter={showAddCharacter ? onAddCharacter : undefined}
          />
        ) : null}
      </div>

      {!hasRows && canManage ? (
        <Text variant="muted">{LOCATION_CONNECTED_PARTIES_EMPTY_TEXT[sectionGroup]}</Text>
      ) : null}
    </>
  )
}
