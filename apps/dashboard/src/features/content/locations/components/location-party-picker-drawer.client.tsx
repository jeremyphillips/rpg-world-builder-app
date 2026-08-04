'use client'

import * as React from 'react'

import {
  getOrganizationKindLabel,
  type LocationPartyAssociationSemanticId,
  type LocationPartyKind,
  type Organization,
} from '@rpg/contracts'
import { CatalogPickerSheet, SegmentedControl, SelectField } from '@rpg/ui'

import { useCampaignCharacters } from '@/features/campaign'
import { useNpcs } from '@/features/character/npc/hooks/use-npcs'
import { useOrganizations } from '@/features/content/organizations/hooks/use-organizations'
import { CatalogPickerItemHeader } from '@/features/character/components/picker/catalog-picker-item-header.client'
import { CatalogPickerSelectionActions } from '@/features/character/components/picker/catalog-picker-selection-actions.client'
import { catalogPickerShellProps } from '@/features/character/components/picker/catalog-picker-shell.lib'

import {
  buildLocationPartySearchText,
  buildLocationPartySemanticOptions,
  buildPartyKindsForSemanticKey,
  segmentLabelForPartyKind,
  type LocationPartyCharacterOption,
} from '../lib/location-party-associations.lib'

export type LocationPartyPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  semanticKey: LocationPartyAssociationSemanticId | null
  onSemanticKeyChange: (semanticKey: LocationPartyAssociationSemanticId) => void
  onSelectParty: (party: { kind: LocationPartyKind; id: string }) => void
}

type PickerItem =
  | { kind: 'character'; character: LocationPartyCharacterOption }
  | { kind: 'organization'; organization: Organization }

const NO_RESULTS_MESSAGE = 'No matches for this search.'
const NO_ITEMS_MESSAGE = 'No parties are available for this relationship.'

export function LocationPartyPickerDrawer({
  open,
  onOpenChange,
  campaignId,
  semanticKey,
  onSemanticKeyChange,
  onSelectParty,
}: LocationPartyPickerDrawerProps) {
  const semanticOptions = React.useMemo(() => buildLocationPartySemanticOptions(), [])
  const partyKinds = semanticKey ? buildPartyKindsForSemanticKey(semanticKey) : []
  const [partyKind, setPartyKind] = React.useState<LocationPartyKind>(partyKinds[0] ?? 'character')

  React.useEffect(() => {
    if (!open || partyKinds.length === 0) return
    setPartyKind((current) => (partyKinds.includes(current) ? current : partyKinds[0]!))
  }, [open, partyKinds])

  const { data: campaignCharacters = [] } = useCampaignCharacters(campaignId)
  const { data: npcs = [] } = useNpcs(campaignId)
  const { data: organizations = [] } = useOrganizations(campaignId)

  const characters = React.useMemo<LocationPartyCharacterOption[]>(() => {
    const pcItems = campaignCharacters.map(({ character }) => ({
      id: character.id,
      name: character.name,
      summary: character.summary,
      characterType: 'pc' as const,
    }))
    const npcItems = npcs.map(({ character }) => ({
      id: character.id,
      name: character.name,
      summary: '',
      characterType: 'npc' as const,
    }))
    return [...pcItems, ...npcItems].sort((left, right) => left.name.localeCompare(right.name))
  }, [campaignCharacters, npcs])

  const items = React.useMemo<PickerItem[]>(() => {
    if (partyKind === 'character') {
      return characters.map((character) => ({ kind: 'character' as const, character }))
    }
    return organizations.map((organization) => ({ kind: 'organization' as const, organization }))
  }, [characters, organizations, partyKind])

  const segmentOptions = partyKinds.map((kind: LocationPartyKind) => ({
    value: kind,
    label: segmentLabelForPartyKind(kind),
  }))

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add relationship"
      description="Choose how someone relates to this location, then pick the character or organization."
      {...catalogPickerShellProps()}
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
      searchPlaceholder="Search people and organizations"
      noResultsMessage={NO_RESULTS_MESSAGE}
      noItemsMessage={NO_ITEMS_MESSAGE}
      primaryControls={
        <SelectField
          id="location-party-relationship"
          label="Relationship"
          value={semanticKey ?? ''}
          options={semanticOptions}
          placeholder="Choose relationship…"
          onValueChange={(value) =>
            onSemanticKeyChange(value as LocationPartyAssociationSemanticId)
          }
        />
      }
      filterRow={
        segmentOptions.length > 1
          ? {
              controls: (
                <SegmentedControl
                  value={partyKind}
                  onValueChange={(value) => setPartyKind(value as LocationPartyKind)}
                  options={segmentOptions}
                  aria-label="Party type"
                />
              ),
            }
          : undefined
      }
      renderItemHeader={(item) => {
        const selected = false
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
                selected={selected}
                canSelect={Boolean(semanticKey)}
                onAdd={() => {
                  if (!semanticKey) return
                  onSelectParty({
                    kind: item.kind,
                    id: item.kind === 'character' ? item.character.id : item.organization.id,
                  })
                  onOpenChange(false)
                }}
                onRemove={() => undefined}
              />
            }
          />
        )
      }}
    />
  )
}
