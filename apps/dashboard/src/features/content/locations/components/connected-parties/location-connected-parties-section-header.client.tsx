'use client'

import type { LocationConnectedPartySectionGroup } from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'

import {
  LOCATION_CONNECTED_PARTIES_EMPTY_TEXT,
  LOCATION_CONNECTED_PARTIES_SECTION_HELPERS,
  LOCATION_CONNECTED_PARTIES_SECTION_LABELS,
} from '../../lib/connected-parties/location-connected-parties-section-copy'

type LocationConnectedPartiesSectionHeaderProps = {
  sectionGroup: LocationConnectedPartySectionGroup
  canManage: boolean
  hasRows: boolean
}

export function LocationConnectedPartiesSectionHeader({
  sectionGroup,
  canManage,
  hasRows,
}: LocationConnectedPartiesSectionHeaderProps) {
  return (
    <>
      <div className="space-y-1">
        <Heading variant="label" as="h2" id={`location-connected-parties-${sectionGroup}-heading`}>
          {LOCATION_CONNECTED_PARTIES_SECTION_LABELS[sectionGroup]}
        </Heading>
        {canManage ? (
          <Text variant="muted">{LOCATION_CONNECTED_PARTIES_SECTION_HELPERS[sectionGroup]}</Text>
        ) : null}
      </div>

      {!hasRows && canManage && sectionGroup === 'people_and_organizations' ? (
        <Text variant="muted">{LOCATION_CONNECTED_PARTIES_EMPTY_TEXT[sectionGroup]}</Text>
      ) : null}
    </>
  )
}
