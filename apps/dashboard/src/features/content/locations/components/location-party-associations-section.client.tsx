'use client'

import * as React from 'react'
import { useParams } from 'react-router-dom'
import { useFormContext } from 'react-hook-form'

import {
  type LocationPartyAssociation,
  type LocationPartyAssociationSemanticId,
  type LocationPartyRef,
} from '@rpg/contracts'
import { Badge, Button, Heading, InsetPanel, Text } from '@rpg/ui'

import { useCampaignCharacters } from '@/features/campaign'
import { useNpcs } from '@/features/character/npc/hooks/use-npcs'
import { useOrganizations } from '@/features/content/organizations/hooks/use-organizations'
import { BuilderInventoryRow } from '@/features/character/components/builder/builder-inventory-row.client'

import { LocationPartyPickerDrawer } from './location-party-picker-drawer.client'
import {
  appendLocationPartyAssociation,
  buildLocationPartyAssociationRows,
  groupLocationPartyAssociationRows,
  LOCATION_PARTY_ADD_LABEL,
  LOCATION_PARTY_ASSOCIATIONS_FIELD,
  LOCATION_PARTY_EMPTY_TEXT,
  removeLocationPartyAssociation,
  type LocationPartyCharacterOption,
} from '../lib/location-party-associations.lib'

export function LocationPartyAssociationsSection() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { setValue, watch } = useFormContext()
  const associations = (watch(LOCATION_PARTY_ASSOCIATIONS_FIELD) ??
    []) as LocationPartyAssociation[]
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [semanticKey, setSemanticKey] = React.useState<LocationPartyAssociationSemanticId | null>(
    'owner',
  )

  const { data: campaignCharacters = [] } = useCampaignCharacters(campaignId)
  const { data: npcs = [] } = useNpcs(campaignId)
  const { data: organizations = [] } = useOrganizations(campaignId)

  const charactersById = React.useMemo(() => {
    const entries: LocationPartyCharacterOption[] = [
      ...campaignCharacters.map(({ character }) => ({
        id: character.id,
        name: character.name,
        summary: character.summary,
        characterType: 'pc' as const,
      })),
      ...npcs.map(({ character }) => ({
        id: character.id,
        name: character.name,
        summary: '',
        characterType: 'npc' as const,
      })),
    ]
    return new Map(entries.map((entry) => [entry.id, entry]))
  }, [campaignCharacters, npcs])

  const organizationsById = React.useMemo(
    () => new Map(organizations.map((organization) => [organization.id, organization])),
    [organizations],
  )

  const rows = React.useMemo(
    () =>
      buildLocationPartyAssociationRows({
        associations,
        charactersById,
        organizationsById,
      }),
    [associations, charactersById, organizationsById],
  )

  const groupedRows = React.useMemo(() => groupLocationPartyAssociationRows(rows), [rows])

  const updateAssociations = (next: LocationPartyAssociation[]) => {
    setValue(LOCATION_PARTY_ASSOCIATIONS_FIELD, next, { shouldDirty: true, shouldValidate: true })
  }

  const handleSelectParty = (selection: { kind: 'character' | 'organization'; id: string }) => {
    if (!semanticKey) return

    const party: LocationPartyRef =
      selection.kind === 'character'
        ? { kind: 'character', characterId: selection.id }
        : { kind: 'organization', organizationId: selection.id }

    updateAssociations(
      appendLocationPartyAssociation({
        associations,
        semanticKey,
        party,
      }),
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <Text variant="muted">
          Link owners, occupants, and operators without changing what kind of place this is.
        </Text>
        <Button type="button" onClick={() => setPickerOpen(true)}>
          {LOCATION_PARTY_ADD_LABEL}
        </Button>
      </div>

      {rows.length === 0 ? (
        <InsetPanel borderStyle="dashed" surface={{}} size="md" align="center" className="py-8">
          <InsetPanel.Text>{LOCATION_PARTY_EMPTY_TEXT}</InsetPanel.Text>
        </InsetPanel>
      ) : (
        <div className="space-y-6">
          {[...groupedRows.entries()].map(([relationshipKey, relationshipRows]) => (
            <div key={relationshipKey} className="space-y-2">
              <Heading variant="label" as="h4">
                {relationshipRows[0]?.semanticLabel ?? relationshipKey}
              </Heading>
              <div className="space-y-2" aria-label={relationshipRows[0]?.semanticLabel}>
                {relationshipRows.map((row) => (
                  <BuilderInventoryRow
                    key={row.association.id}
                    itemLabel={`${row.semanticLabel}: ${row.partyLabel}`}
                    label={<Text as="span">{row.partyLabel}</Text>}
                    meta={
                      row.partyUnresolved ? <Badge tone="warning">Unavailable</Badge> : undefined
                    }
                    onRemove={() =>
                      updateAssociations(
                        removeLocationPartyAssociation(associations, row.association.id),
                      )
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <LocationPartyPickerDrawer
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        campaignId={campaignId}
        semanticKey={semanticKey}
        onSemanticKeyChange={setSemanticKey}
        onSelectParty={handleSelectParty}
      />
    </div>
  )
}
