import * as React from 'react'

import type { CharacterRelationshipProjectionRow } from '@rpg/contracts'
import { Button, Eyebrow, Modal, SelectField, Text } from '@rpg/ui'

import {
  PERSON_CONNECTION_ROLE_OPTIONS,
  PLACE_CONNECTION_ROLE_OPTIONS,
  PROPERTY_CONNECTION_ROLE_OPTIONS,
} from '../../../lib/relationship/connection-role-catalog'
import {
  resolvePersonRoleOptionFromProjection,
  resolvePlaceRoleOptionFromProjection,
  resolvePropertyRoleOptionFromProjection,
} from '../../../lib/relationship/connection-role-from-projection.lib'
import { resolveConnectionSheetEditCopy } from '../../../lib/relationship/connection-sheet-edit-copy.lib'
import type { ConnectionSheetData } from '../../../lib/relationship/connection-sheet-data.lib'
import { getConnectionTopLevelSectionForKind } from '../../../lib/relationship/connection-section-catalog'
import {
  buildConnectionDetailsPatch,
  connectionDetailsFromProjection,
  type ConnectionDetailsFormState,
} from '../../../lib/relationship/connection-details-fields.lib'
import { ConnectionDetailsFields } from './character-connection-details-fields'

export type CharacterConnectionEditModalProps = {
  open: boolean
  row: CharacterRelationshipProjectionRow | null
  sheetData: ConnectionSheetData
  onOpenChange: (open: boolean) => void
  onSave: (
    row: CharacterRelationshipProjectionRow,
    input: {
      personRoleId?: string
      placeRoleId?: string
      propertyRoleId?: string
      details: Record<string, unknown>
    },
  ) => Promise<void>
  onRemove: (row: CharacterRelationshipProjectionRow) => Promise<void>
}

function resolveSubmitError(error: unknown, fallback: string): string {
  return error instanceof Error && error.message.trim().length > 0 ? error.message : fallback
}

function resolveInitialRoleId(row: CharacterRelationshipProjectionRow): string | null {
  const sectionId = getConnectionTopLevelSectionForKind(row.kind)

  if (sectionId === 'people') return resolvePersonRoleOptionFromProjection(row)?.id ?? null
  if (sectionId === 'places') return resolvePlaceRoleOptionFromProjection(row)?.id ?? null
  if (sectionId === 'property') return resolvePropertyRoleOptionFromProjection(row)?.id ?? null
  return null
}

// fallow-ignore-next-line complexity
export function CharacterConnectionEditModal({
  open,
  row,
  sheetData,
  onOpenChange,
  onSave,
  onRemove,
}: CharacterConnectionEditModalProps) {
  const [selectedRoleId, setSelectedRoleId] = React.useState<string | null>(() =>
    row ? resolveInitialRoleId(row) : null,
  )
  const [detailsState, setDetailsState] = React.useState<ConnectionDetailsFormState>(() =>
    connectionDetailsFromProjection(row),
  )
  const [pending, setPending] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (pending) return
      onOpenChange(nextOpen)
    },
    [onOpenChange, pending],
  )

  if (!row) return null

  const sectionId = getConnectionTopLevelSectionForKind(row.kind)
  const copy = resolveConnectionSheetEditCopy(sectionId)
  const roleOptions =
    sectionId === 'people'
      ? PERSON_CONNECTION_ROLE_OPTIONS
      : sectionId === 'places'
        ? PLACE_CONNECTION_ROLE_OPTIONS
        : sectionId === 'property'
          ? PROPERTY_CONNECTION_ROLE_OPTIONS
          : []

  const entityLabel =
    sectionId === 'people'
      ? 'Person'
      : sectionId === 'organizations'
        ? 'Organization'
        : sectionId === 'places'
          ? 'Place'
          : 'Property'

  const handleSave = async () => {
    if (pending) return
    setPending(true)
    setSubmitError(null)

    try {
      const selectedPersonRole = PERSON_CONNECTION_ROLE_OPTIONS.find(
        (role) => role.id === selectedRoleId,
      )
      const selectedPlaceRole = PLACE_CONNECTION_ROLE_OPTIONS.find(
        (role) => role.id === selectedRoleId,
      )
      const selectedPropertyRole = PROPERTY_CONNECTION_ROLE_OPTIONS.find(
        (role) => role.id === selectedRoleId,
      )

      await onSave(row, {
        ...(selectedPersonRole ? { personRoleId: selectedPersonRole.id } : {}),
        ...(selectedPlaceRole ? { placeRoleId: selectedPlaceRole.id } : {}),
        ...(selectedPropertyRole ? { propertyRoleId: selectedPropertyRole.id } : {}),
        details: buildConnectionDetailsPatch(row.kind, detailsState),
      })
      handleOpenChange(false)
    } catch (error) {
      setSubmitError(resolveSubmitError(error, 'Could not save this connection.'))
    } finally {
      setPending(false)
    }
  }

  const handleRemove = async () => {
    if (pending) return
    setPending(true)
    setSubmitError(null)

    try {
      await onRemove(row)
      handleOpenChange(false)
    } catch (error) {
      setSubmitError(resolveSubmitError(error, 'Could not remove this connection.'))
      setPending(false)
    }
  }

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Content size="md" aria-describedby="character-connection-edit-description">
        <Modal.Header headline={copy.modalTitle} />
        <Modal.Body id="character-connection-edit-description">
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <Eyebrow size="sm">{entityLabel}</Eyebrow>
              <Text>{row.target?.name ?? 'Unavailable'}</Text>
            </div>

            {roleOptions.length > 0 ? (
              <SelectField
                id="connection-edit-relationship"
                label="Relationship"
                value={selectedRoleId ?? ''}
                onValueChange={setSelectedRoleId}
                options={roleOptions.map((role) => ({
                  value: role.id,
                  label: role.label,
                }))}
              />
            ) : null}

            <ConnectionDetailsFields
              rowKind={row.kind}
              organizationId={row.target?.type === 'organization' ? row.target.id : undefined}
              sheetData={sheetData}
              state={detailsState}
              onStateChange={setDetailsState}
            />

            {submitError ? (
              <Text variant="destructive" role="alert">
                {submitError}
              </Text>
            ) : null}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex w-full items-center justify-between gap-3">
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() => void handleRemove()}
            >
              {copy.removeLabel}
            </Button>
            <Modal.FooterActions>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="button" disabled={pending} onClick={() => void handleSave()}>
                Save
              </Button>
            </Modal.FooterActions>
          </div>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
