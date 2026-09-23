import {
  characterRelationshipEdgeKindSupportsLifecycle,
  type CharacterRelationshipProjectionRow,
} from '@rpg/contracts'
import { CheckboxField, Eyebrow, SelectField, Text } from '@rpg/ui'

import { OrganizationMembershipTitleField } from '../../connections/organization-membership-title-field'
import { ConnectionAudienceFields } from './connection-audience-fields'
import type { ConnectionSheetData } from '../../../lib/relationship/connection-sheet-data.lib'
import type { ConnectionDetailsFormState } from '../../../lib/relationship/connection-details-fields.lib'

export type ConnectionDetailsFieldsProps = {
  rowKind: CharacterRelationshipProjectionRow['kind']
  organizationId?: string
  sheetData: ConnectionSheetData
  state: ConnectionDetailsFormState
  onStateChange: (next: ConnectionDetailsFormState) => void
  showAudienceFields?: boolean
}

export function ConnectionDetailsFields({
  rowKind,
  organizationId,
  sheetData,
  state,
  onStateChange,
  showAudienceFields = false,
}: ConnectionDetailsFieldsProps) {
  const organization = organizationId ? sheetData.organizationsById.get(organizationId) : undefined

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <Eyebrow size="sm">Since</Eyebrow>
        <Text variant="muted">—</Text>
      </div>

      {showAudienceFields ? (
        <ConnectionAudienceFields
          campaignId={sheetData.campaignId}
          state={state}
          onStateChange={onStateChange}
        />
      ) : null}

      {rowKind === 'organizationMembership' && organization ? (
        <OrganizationMembershipTitleField
          titles={organization.members?.titles ?? []}
          value={state.membershipTitle}
          onValueChange={(membershipTitle) => onStateChange({ ...state, membershipTitle })}
          idPrefix={`connection-membership-${organization.id}`}
        />
      ) : null}

      {rowKind === 'resides_at' ? (
        <CheckboxField
          id="connection-residence-primary"
          label="Primary residence"
          checked={state.isPrimary}
          onCheckedChange={(checked) => onStateChange({ ...state, isPrimary: checked === true })}
        />
      ) : null}

      {rowKind !== 'organizationMembership' &&
      characterRelationshipEdgeKindSupportsLifecycle(rowKind) ? (
        <SelectField
          id="connection-lifecycle"
          label="Status"
          value={state.lifecycle}
          onValueChange={(lifecycle) =>
            onStateChange({
              ...state,
              lifecycle: lifecycle as ConnectionDetailsFormState['lifecycle'],
            })
          }
          options={[
            { value: 'current', label: 'Current' },
            { value: 'former', label: 'Former' },
          ]}
        />
      ) : null}
    </div>
  )
}
