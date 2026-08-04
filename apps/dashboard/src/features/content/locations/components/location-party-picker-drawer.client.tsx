'use client'

import * as React from 'react'

import {
  getOrganizationKindLabel,
  type LocationPartyAssociation,
  type LocationPartyAssociationSemanticId,
  type LocationPartyKind,
  type LocationPartyRef,
  type Organization,
} from '@rpg/contracts'
import {
  CatalogPickerSheet,
  FieldRadiogroupLabel,
  SegmentedControl,
  SelectField,
  Text,
} from '@rpg/ui'

import { useCampaignCharacters } from '@/features/campaign'
import { resolveCatalogPickerRowActionPhase } from '@/features/character'
import { CatalogPickerItemHeader } from '@/features/character'
import { CatalogPickerSelectionActions } from '@/features/character'
import { catalogPickerShellProps } from '@/features/character'
import { CATALOG_PICKER_COMMIT_SUCCESS_MS } from '@/features/character'
import { useNpcs } from '@/features/character'
import { useOrganizations } from '@/features/content'

import {
  buildLocationPartyAddActionLabel,
  buildLocationPartyAssociationExactKeyFromSelection,
  buildLocationPartyCharactersById,
  buildLocationPartySearchText,
  buildLocationPartySemanticOptions,
  buildPartyKindsForSemanticKey,
  buildRelatedToSegmentOptions,
  findLocationPartyAssociationId,
  isLocationPartyAssociationSelected,
  LOCATION_PARTY_CHOOSE_RELATIONSHIP_LIST_MESSAGE,
  LOCATION_PARTY_RELATED_TO_LABEL,
  LOCATION_PARTY_RELATIONSHIP_PLACEHOLDER,
  LOCATION_PARTY_SEARCH_DISABLED_PLACEHOLDER,
  resolvePartyKindForRelationshipChange,
  type LocationPartyCharacterOption,
} from '../lib/location-party-associations.lib'
import type { LocationAuthoringType } from '../lib/location-authoring-type'

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

type PickerItem =
  | { kind: 'character'; character: LocationPartyCharacterOption }
  | { kind: 'organization'; organization: Organization }

const NO_RESULTS_MESSAGE = 'No matches for this search.'
const NO_ITEMS_MESSAGE = 'No parties are available for this relationship.'

function useLocationPartySuccessFlashes(clearWhen: string) {
  const [flashKeys, setFlashKeys] = React.useState<ReadonlySet<string>>(() => new Set())

  React.useEffect(() => {
    setFlashKeys(new Set())
  }, [clearWhen])

  const triggerFlash = React.useCallback((exactKey: string) => {
    setFlashKeys((current) => new Set(current).add(exactKey))
    window.setTimeout(() => {
      setFlashKeys((current) => {
        if (!current.has(exactKey)) return current
        const next = new Set(current)
        next.delete(exactKey)
        return next
      })
    }, CATALOG_PICKER_COMMIT_SUCCESS_MS)
  }, [])

  return { flashKeys, triggerFlash }
}

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
  const semanticOptions = React.useMemo(
    () => buildLocationPartySemanticOptions(authoringType),
    [authoringType],
  )
  const partyKinds = semanticKey ? buildPartyKindsForSemanticKey(semanticKey) : []
  const [partyKind, setPartyKind] = React.useState<LocationPartyKind | null>(null)

  React.useEffect(() => {
    if (!open) return
    setPartyKind((current) =>
      resolvePartyKindForRelationshipChange({ previousPartyKind: current, partyKinds }),
    )
  }, [open, partyKinds])

  const relationshipContextKey = `${semanticKey ?? 'none'}::${partyKind ?? 'none'}`
  const { flashKeys, triggerFlash } = useLocationPartySuccessFlashes(relationshipContextKey)

  const { data: campaignCharacters = [] } = useCampaignCharacters(campaignId)
  const { data: npcs = [] } = useNpcs(campaignId)
  const { data: organizations = [] } = useOrganizations(campaignId)

  const characters = React.useMemo(
    () => [...buildLocationPartyCharactersById(campaignCharacters, npcs).values()],
    [campaignCharacters, npcs],
  )

  const items = React.useMemo<PickerItem[]>(() => {
    if (!semanticKey || !partyKind) return []

    if (partyKind === 'character') {
      return characters.map((character) => ({ kind: 'character' as const, character }))
    }
    return organizations.map((organization) => ({ kind: 'organization' as const, organization }))
  }, [characters, organizations, partyKind, semanticKey])

  const segmentOptions = React.useMemo(
    () => buildRelatedToSegmentOptions(semanticKey),
    [semanticKey],
  )

  const addActionLabel = semanticKey ? buildLocationPartyAddActionLabel(semanticKey) : 'Add'
  const searchDisabled = !semanticKey
  const searchPlaceholder = semanticKey
    ? 'Search people and organizations'
    : LOCATION_PARTY_SEARCH_DISABLED_PLACEHOLDER

  const headerControls = (
    <div className="space-y-4">
      <SelectField
        id="location-party-relationship"
        label="Relationship"
        value={semanticKey ?? ''}
        options={semanticOptions}
        placeholder={LOCATION_PARTY_RELATIONSHIP_PLACEHOLDER}
        onValueChange={(value) => onSemanticKeyChange(value as LocationPartyAssociationSemanticId)}
      />
      <div className="space-y-2">
        <FieldRadiogroupLabel
          id="location-party-related-to-label"
          label={LOCATION_PARTY_RELATED_TO_LABEL}
        />
        <SegmentedControl
          fullWidth
          value={partyKind}
          onValueChange={(value) => setPartyKind(value as LocationPartyKind)}
          options={segmentOptions}
          aria-label={LOCATION_PARTY_RELATED_TO_LABEL}
        />
      </div>
    </div>
  )

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add relationship"
      {...catalogPickerShellProps()}
      headerBelowDescription={headerControls}
      searchDisabled={searchDisabled}
      searchPlaceholder={searchPlaceholder}
      emptyState={
        semanticKey ? undefined : (
          <Text variant="muted" className="text-sm" role="status">
            {LOCATION_PARTY_CHOOSE_RELATIONSHIP_LIST_MESSAGE}
          </Text>
        )
      }
      items={items}
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
      renderItemHeader={(item) => {
        if (!semanticKey) return null

        const party: LocationPartyRef =
          item.kind === 'character'
            ? { kind: 'character', characterId: item.character.id }
            : { kind: 'organization', organizationId: item.organization.id }

        const exactKey = buildLocationPartyAssociationExactKeyFromSelection({
          semanticKey,
          party,
        })
        const isSelected = isLocationPartyAssociationSelected({
          associations,
          semanticKey,
          party,
        })
        const isSuccess = flashKeys.has(exactKey)
        const phase = resolveCatalogPickerRowActionPhase({ isSuccess, isSelected })
        const associationId = findLocationPartyAssociationId({
          associations,
          semanticKey,
          party,
        })

        const name = item.kind === 'character' ? item.character.name : item.organization.name
        const metadata =
          item.kind === 'organization'
            ? getOrganizationKindLabel(item.organization.organizationKind)
            : item.character.summary

        return (
          <CatalogPickerItemHeader
            name={name}
            metadataLines={metadata ? [{ segments: [{ type: 'text', text: metadata }] }] : []}
            actions={
              <CatalogPickerSelectionActions
                phase={phase}
                canSelect={Boolean(semanticKey)}
                addLabel={addActionLabel}
                onAdd={() => {
                  if (!semanticKey) return
                  onSelectParty({
                    kind: item.kind,
                    id: item.kind === 'character' ? item.character.id : item.organization.id,
                  })
                  triggerFlash(exactKey)
                }}
                onRemove={() => {
                  if (!associationId) return
                  onRemoveParty(associationId)
                }}
              />
            }
          />
        )
      }}
    />
  )
}
