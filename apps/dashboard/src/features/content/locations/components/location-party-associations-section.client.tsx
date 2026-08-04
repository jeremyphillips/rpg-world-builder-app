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
  buildLocationPartyCharactersById,
  groupLocationPartyAssociationRows,
  LOCATION_PARTY_ADD_LABEL,
  LOCATION_PARTY_ASSOCIATIONS_FIELD,
  LOCATION_PARTY_EMPTY_TEXT,
  LOCATION_PARTY_SECTION_DESCRIPTION,
  removeLocationPartyAssociation,
} from '../lib/location-party-associations.lib'
import {
  resolveAuthoringTypeFromFormValues,
  type LocationAuthoringType,
} from '../lib/location-authoring-type'
import { isLocationPartyAssociationAuthoringSupported } from '../lib/location-party-authoring-policy'

export type LocationPartyAssociationsSectionProps = {
  campaignId?: string
}

export function LocationPartyAssociationsSection({
  campaignId: campaignIdProp,
}: LocationPartyAssociationsSectionProps = {}) {
  const { campaignId: campaignIdParam = '' } = useParams<{ campaignId: string }>()
  const campaignId = campaignIdProp ?? campaignIdParam
  const { setValue, watch } = useFormContext()
  const associations = (watch(LOCATION_PARTY_ASSOCIATIONS_FIELD) ??
    []) as LocationPartyAssociation[]
  const authoringType = resolveAuthoringTypeFromFormValues(watch()) as LocationAuthoringType
  const canAddAssociations = isLocationPartyAssociationAuthoringSupported(authoringType)
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [semanticKey, setSemanticKey] = React.useState<LocationPartyAssociationSemanticId | null>(
    null,
  )

  const { data: campaignCharacters = [] } = useCampaignCharacters(campaignId)
  const { data: npcs = [] } = useNpcs(campaignId)
  const { data: organizations = [] } = useOrganizations(campaignId)

  const charactersById = React.useMemo(
    () => buildLocationPartyCharactersById(campaignCharacters, npcs),
    [campaignCharacters, npcs],
  )

  const organizationsById = React.useMemo(
    () => new Map(organizations.map((organization) => [organization.id, organization])),
    [organizations],
  )

  const rows = React.useMemo(
    () =>
      buildLocationPartyAssociationRows({
        associations,
        campaignId,
        charactersById,
        organizationsById,
      }),
    [associations, campaignId, charactersById, organizationsById],
  )

  const groupedRows = React.useMemo(() => groupLocationPartyAssociationRows(rows), [rows])

  const updateAssociations = (next: LocationPartyAssociation[]) => {
    setValue(LOCATION_PARTY_ASSOCIATIONS_FIELD, next, { shouldDirty: true, shouldValidate: true })
  }

  const handleOpenPicker = () => {
    if (!canAddAssociations) return
    setSemanticKey(null)
    setPickerOpen(true)
  }

  const handlePickerOpenChange = (open: boolean) => {
    setPickerOpen(open)
    if (!open) {
      setSemanticKey(null)
    }
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

  const handleRemoveParty = (associationId: string) => {
    updateAssociations(removeLocationPartyAssociation(associations, associationId))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Text variant="muted">{LOCATION_PARTY_SECTION_DESCRIPTION}</Text>
        {canAddAssociations ? (
          <Button type="button" onClick={handleOpenPicker}>
            {LOCATION_PARTY_ADD_LABEL}
          </Button>
        ) : null}
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
                    footer={
                      row.partySummary ? (
                        <Text variant="muted" className="text-sm">
                          {row.partySummary}
                        </Text>
                      ) : undefined
                    }
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

      {canAddAssociations ? (
        <LocationPartyPickerDrawer
          open={pickerOpen}
          onOpenChange={handlePickerOpenChange}
          campaignId={campaignId}
          associations={associations}
          authoringType={authoringType}
          semanticKey={semanticKey}
          onSemanticKeyChange={setSemanticKey}
          onSelectParty={handleSelectParty}
          onRemoveParty={handleRemoveParty}
        />
      ) : null}
    </div>
  )
}
