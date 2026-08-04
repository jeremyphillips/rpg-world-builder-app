'use client'

import { FieldRadiogroupLabel, SegmentedControl, SelectField } from '@rpg/ui'
import type { LocationPartyAssociationSemanticId, LocationPartyKind } from '@rpg/contracts'

import {
  buildRelatedToSegmentOptions,
  LOCATION_PARTY_RELATED_TO_LABEL,
  LOCATION_PARTY_RELATIONSHIP_PLACEHOLDER,
} from '../lib/location-party-associations.lib'

type LocationPartyPickerRelationshipControlsProps = {
  semanticKey: LocationPartyAssociationSemanticId | null
  semanticOptions: Array<{ value: string; label: string }>
  partyKind: LocationPartyKind | null
  onSemanticKeyChange: (semanticKey: LocationPartyAssociationSemanticId) => void
  onPartyKindChange: (partyKind: LocationPartyKind) => void
}

export function LocationPartyPickerRelationshipControls({
  semanticKey,
  semanticOptions,
  partyKind,
  onSemanticKeyChange,
  onPartyKindChange,
}: LocationPartyPickerRelationshipControlsProps) {
  const segmentOptions = buildRelatedToSegmentOptions(semanticKey)

  return (
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
          onValueChange={(value) => onPartyKindChange(value as LocationPartyKind)}
          options={segmentOptions}
          aria-label={LOCATION_PARTY_RELATED_TO_LABEL}
        />
      </div>
    </div>
  )
}
