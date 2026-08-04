'use client'

import { getOrganizationKindLabel } from '@rpg/contracts'
import type {
  LocationPartyAssociation,
  LocationPartyAssociationSemanticId,
  LocationPartyKind,
} from '@rpg/contracts'
import { CatalogPickerSheet, Text } from '@rpg/ui'

import { catalogPickerShellProps } from '@/features/character'

import {
  buildLocationPartySearchText,
  LOCATION_PARTY_CHOOSE_RELATIONSHIP_LIST_MESSAGE,
  LOCATION_PARTY_SEARCH_DISABLED_PLACEHOLDER,
} from '../lib/location-party-associations.lib'
import type { LocationAuthoringType } from '../lib/location-authoring-type'
import { useLocationPartyPickerDrawer } from '../hooks/use-location-party-picker-drawer.client'
import { LocationPartyPickerItemHeader } from './location-party-picker-item-header.client'
import { LocationPartyPickerRelationshipControls } from './location-party-picker-relationship-controls.client'

export type LocationPartyPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  associations: readonly LocationPartyAssociation[]
  authoringType: LocationAuthoringType
  semanticKey: LocationPartyAssociationSemanticId | null
  onSemanticKeyChange: (semanticKey: LocationPartyAssociationSemanticId) => void
  onSelectParty: (party: { kind: LocationPartyKind; id: string }) => void
  onRemoveParty: (associationId: string) => void
}

const NO_RESULTS_MESSAGE = 'No matches for this search.'
const NO_ITEMS_MESSAGE = 'No parties are available for this relationship.'

export function LocationPartyPickerDrawer({
  open,
  onOpenChange,
  campaignId,
  associations,
  authoringType,
  semanticKey,
  onSemanticKeyChange,
  onSelectParty,
  onRemoveParty,
}: LocationPartyPickerDrawerProps) {
  const picker = useLocationPartyPickerDrawer({
    open,
    campaignId,
    authoringType,
    semanticKey,
  })

  const searchDisabled = !semanticKey
  const searchPlaceholder = semanticKey
    ? 'Search people and organizations'
    : LOCATION_PARTY_SEARCH_DISABLED_PLACEHOLDER

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add relationship"
      {...catalogPickerShellProps()}
      headerBelowDescription={
        <LocationPartyPickerRelationshipControls
          semanticKey={semanticKey}
          semanticOptions={picker.semanticOptions}
          partyKind={picker.partyKind}
          onSemanticKeyChange={onSemanticKeyChange}
          onPartyKindChange={picker.setPartyKind}
        />
      }
      searchDisabled={searchDisabled}
      searchPlaceholder={searchPlaceholder}
      emptyState={
        semanticKey ? undefined : (
          <Text variant="muted" className="text-sm" role="status">
            {LOCATION_PARTY_CHOOSE_RELATIONSHIP_LIST_MESSAGE}
          </Text>
        )
      }
      items={picker.items}
      getItemKey={(item) => (item.kind === 'character' ? item.character.id : item.organization.id)}
      getItemToolbarLabel={(item) =>
        item.kind === 'character' ? item.character.name : item.organization.name
      }
      getSearchText={(item) =>
        item.kind === 'character'
          ? buildLocationPartySearchText({
              name: item.character.name,
              summary: item.character.summary,
            })
          : buildLocationPartySearchText({
              name: item.organization.name,
              organizationKindLabel: getOrganizationKindLabel(item.organization.organizationKind),
            })
      }
      noResultsMessage={NO_RESULTS_MESSAGE}
      noItemsMessage={NO_ITEMS_MESSAGE}
      renderItemHeader={(item) => (
        <LocationPartyPickerItemHeader
          item={item}
          semanticKey={semanticKey}
          associations={associations}
          flashKeys={picker.flashKeys}
          onSelectParty={onSelectParty}
          onRemoveParty={onRemoveParty}
          onFlash={picker.triggerFlash}
        />
      )}
    />
  )
}
