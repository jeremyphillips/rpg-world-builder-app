'use client'

import type { Location } from '@rpg/contracts'

import { LocationInverseCharacterConnectionLinkDrawer } from './location-inverse-character-connection-link-drawer.client'
import { LocationInverseOrganizationConnectionLinkDrawer } from './location-inverse-organization-connection-link-drawer.client'
import type { useLocationConnectedPartiesDetail } from '../hooks/use-location-connected-parties-detail.client'

type DetailState = ReturnType<typeof useLocationConnectedPartiesDetail>

type LocationConnectedPartiesDrawersProps = {
  location: Location
  detail: DetailState
}

export function LocationConnectedPartiesDrawers({
  location,
  detail,
}: LocationConnectedPartiesDrawersProps) {
  return (
    <>
      {detail.canAddOrganization ? (
        <LocationInverseOrganizationConnectionLinkDrawer
          open={detail.organizationDrawerState != null}
          onOpenChange={(open) => {
            if (!open) detail.setOrganizationDrawerState(null)
          }}
          mode={detail.organizationDrawerState?.mode ?? 'add'}
          location={location}
          organizations={detail.organizations}
          connectedPartyRows={detail.rows}
          initialConnection={
            detail.organizationDrawerState?.mode === 'edit'
              ? detail.organizationDrawerState.connection
              : undefined
          }
          isSubmitting={detail.isMutationPending}
          onSubmit={detail.handleOrganizationSubmit}
        />
      ) : null}

      {detail.canAddCharacter ? (
        <LocationInverseCharacterConnectionLinkDrawer
          open={detail.characterDrawerState != null}
          onOpenChange={(open) => {
            if (!open) detail.setCharacterDrawerState(null)
          }}
          mode={detail.characterDrawerState?.mode ?? 'add'}
          location={location}
          characters={detail.characterOptions}
          connectedPartyRows={detail.rows}
          initialConnection={
            detail.characterDrawerState?.mode === 'edit'
              ? detail.characterDrawerState.connection
              : undefined
          }
          isSubmitting={detail.isMutationPending}
          onSubmit={detail.handleCharacterSubmit}
        />
      ) : null}
    </>
  )
}
