'use client'

import type { Location } from '@rpg/contracts'

import { LocationInverseCharacterConnectionLinkDrawer } from './location-inverse-character-connection-link-drawer.client'
import { LocationInverseOrganizationConnectionLinkDrawer } from './location-inverse-organization-connection-link-drawer.client'
import { LocationInversePeopleConnectionLinkDrawer } from './location-inverse-people-connection-link-drawer.client'
import type { useLocationConnectedPartiesDetail } from '../hooks/use-location-connected-parties-detail.client'

type DetailState = ReturnType<typeof useLocationConnectedPartiesDetail>

type LocationConnectedPartiesDrawersProps = {
  location: Location
  detail: DetailState
}

function LocationConnectedOrganizationDrawer({
  location,
  detail,
}: LocationConnectedPartiesDrawersProps) {
  const drawerState = detail.organizationDrawerState
  if (!detail.canAddOrganizationInverse || !drawerState) {
    return null
  }

  return (
    <LocationInverseOrganizationConnectionLinkDrawer
      open
      onOpenChange={(open) => {
        if (!open) detail.setOrganizationDrawerState(null)
      }}
      mode={drawerState.mode}
      intent={drawerState.intent}
      addKind={drawerState.mode === 'add' ? drawerState.kind : undefined}
      location={location}
      organizations={detail.organizations}
      connectedPartyRows={detail.rows}
      initialConnection={
        drawerState.mode === 'changeKind' || drawerState.mode === 'replaceOrganization'
          ? drawerState.connection
          : undefined
      }
      isSubmitting={detail.isMutationPending}
      onSubmit={detail.handleOrganizationSubmit}
    />
  )
}

function LocationConnectedCharacterDrawer({
  location,
  detail,
}: LocationConnectedPartiesDrawersProps) {
  if (!detail.canAddCharacter) {
    return null
  }

  const drawerState = detail.characterDrawerState

  return (
    <LocationInverseCharacterConnectionLinkDrawer
      open={drawerState != null}
      onOpenChange={(open) => {
        if (!open) detail.setCharacterDrawerState(null)
      }}
      mode={drawerState?.mode ?? 'add'}
      addKind={drawerState?.mode === 'add' ? drawerState.kind : undefined}
      location={location}
      characters={detail.characterOptions}
      connectedPartyRows={detail.rows}
      initialConnection={drawerState?.mode === 'edit' ? drawerState.connection : undefined}
      isSubmitting={detail.isMutationPending}
      onSubmit={detail.handleCharacterSubmit}
    />
  )
}

function LocationConnectedPeopleDrawer({ location, detail }: LocationConnectedPartiesDrawersProps) {
  const drawerState = detail.peopleDrawerState
  if (!drawerState) {
    return null
  }

  return (
    <LocationInversePeopleConnectionLinkDrawer
      open
      onOpenChange={(open) => {
        if (!open) detail.setPeopleDrawerState(null)
      }}
      kindSlots={detail.peopleKindSlots}
      location={location}
      organizations={detail.organizations}
      characters={detail.characterOptions}
      connectedPartyRows={detail.rows}
      canAddOrganization={detail.canAddOrganizationInverse}
      canAddCharacter={detail.canAddCharacter}
      isSubmitting={detail.isMutationPending}
      onOrganizationSubmit={detail.handlePeopleDrawerOrganizationSubmit}
      onCharacterSubmit={detail.handlePeopleDrawerCharacterSubmit}
    />
  )
}

export function LocationConnectedPartiesDrawers(props: LocationConnectedPartiesDrawersProps) {
  return (
    <>
      <LocationConnectedOrganizationDrawer {...props} />
      <LocationConnectedCharacterDrawer {...props} />
      <LocationConnectedPeopleDrawer {...props} />
    </>
  )
}
