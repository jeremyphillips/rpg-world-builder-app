'use client'

import type { LocationConnectedPartySectionGroup } from '@rpg/contracts'
import { Button, Heading, Text } from '@rpg/ui'

import {
  LOCATION_CONNECTED_PARTIES_EMPTY_TEXT,
  LOCATION_CONNECTED_PARTIES_SECTION_HELPERS,
  LOCATION_CONNECTED_PARTIES_SECTION_LABELS,
} from './location-connected-parties-section.client'

type LocationConnectedPartiesSectionHeaderProps = {
  sectionGroup: LocationConnectedPartySectionGroup
  canManage: boolean
  hasRows: boolean
  onAddOrganization?: () => void
  onAddCharacter?: () => void
}

// fallow-ignore-next-line complexity
export function LocationConnectedPartiesSectionHeader({
  sectionGroup,
  canManage,
  hasRows,
  onAddOrganization,
  onAddCharacter,
}: LocationConnectedPartiesSectionHeaderProps) {
  const showAddOrganization =
    canManage &&
    (sectionGroup === 'territorial_authority' || sectionGroup === 'people_and_organizations') &&
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
        {showAddOrganization || showAddCharacter ? (
          <div className="flex flex-wrap justify-end gap-2">
            {showAddOrganization ? (
              <Button type="button" variant="outline" onClick={onAddOrganization}>
                Link organization
              </Button>
            ) : null}
            {showAddCharacter ? (
              <Button type="button" variant="outline" onClick={onAddCharacter}>
                Link character
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {!hasRows && canManage ? (
        <Text variant="muted">{LOCATION_CONNECTED_PARTIES_EMPTY_TEXT[sectionGroup]}</Text>
      ) : null}
    </>
  )
}
