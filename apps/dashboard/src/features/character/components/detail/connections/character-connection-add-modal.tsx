import * as React from 'react'

import {
  resolveLocationClassificationDisplay,
  resolveOrganizationMembershipMetadata,
} from '@rpg/contracts'
import { Button, Modal, SelectField, Text } from '@rpg/ui'

import { titleFromMembershipRadioValue } from '../../../lib/organization-membership/organization-membership-title.lib'
import { buildCharacterEntityCardModel } from '../../../lib/display/character-entity-summary.lib'
import {
  buildCharacterPickerOptionEntitySummary,
  buildCharacterPickerOptionSearchText,
} from '../../../lib/picker/character-picker-option.lib'
import { getContentDisplayImage } from '@/features/content/lib/detail/page/content-display-image'
import { buildLocationContentDisplayImageInput } from '@/features/content/lib/detail/page/content-display-image-input'
import { buildLocationEntityCardModelFromClassification } from '@/features/content/locations/lib/location-display'
import {
  buildOrganizationEntityCardModel,
  buildOrganizationEntitySummaryVm,
} from '@/features/content/organizations/lib/organization-display'
import {
  PERSON_CONNECTION_ROLE_OPTIONS,
  PLACE_CONNECTION_ROLE_OPTIONS,
  PROPERTY_CONNECTION_ROLE_OPTIONS,
  type PersonConnectionRoleOption,
  type PlaceConnectionRoleOption,
  type PropertyConnectionRoleOption,
} from '../../../lib/relationship/connection-role-catalog'
import { resolveConnectionSheetEditCopy } from '../../../lib/relationship/connection-sheet-edit-copy.lib'
import type { ConnectionSheetData } from '../../../lib/relationship/connection-sheet-data.lib'
import type { ConnectionTopLevelSectionId } from '../../../lib/relationship/connection-section-catalog'
import {
  filterAndSortOrganizationPickerItems,
  getOrganizationPickerSearchText,
} from '../../connections/picker/organization-picker-drawer.lib'
import {
  ORGANIZATION_PICKER_NO_ITEMS_MESSAGE,
  ORGANIZATION_PICKER_NO_RESULTS_MESSAGE,
} from '../../connections/picker/organization-picker-drawer.types'
import {
  buildConnectionDetailsPatch,
  EMPTY_CONNECTION_DETAILS_FORM_STATE,
  type ConnectionDetailsFormState,
} from '../../../lib/relationship/connection-details-fields.lib'
import { ConnectionDetailsFields } from './character-connection-details-fields'
import { ConnectionEntityPicker } from './character-connection-entity-picker'

type AddModalStep = 'entity' | 'relationship' | 'details'

export type CharacterConnectionAddModalProps = {
  open: boolean
  sectionId: ConnectionTopLevelSectionId | null
  sheetData: ConnectionSheetData
  existingProjectionKinds: ReadonlySet<string>
  onOpenChange: (open: boolean) => void
  onAddPerson: (relatedCharacterId: string, role: PersonConnectionRoleOption) => Promise<void>
  onAddOrganization: (organizationId: string, title?: string, priority?: number) => Promise<void>
  onAddPlace: (
    locationId: string,
    role: PlaceConnectionRoleOption,
    details?: Record<string, unknown>,
  ) => Promise<void>
  onAddProperty: (
    locationId: string,
    role: PropertyConnectionRoleOption,
    details?: Record<string, unknown>,
  ) => Promise<void>
}

function resolveSubmitError(error: unknown, fallback: string): string {
  return error instanceof Error && error.message.trim().length > 0 ? error.message : fallback
}

// fallow-ignore-next-line complexity
export function CharacterConnectionAddModal({
  open,
  sectionId,
  sheetData,
  existingProjectionKinds,
  onOpenChange,
  onAddPerson,
  onAddOrganization,
  onAddPlace,
  onAddProperty,
}: CharacterConnectionAddModalProps) {
  const [step, setStep] = React.useState<AddModalStep>('entity')
  const [selectedEntityId, setSelectedEntityId] = React.useState<string | null>(null)
  const [selectedRoleId, setSelectedRoleId] = React.useState<string | null>(null)
  const [detailsState, setDetailsState] = React.useState<ConnectionDetailsFormState>(
    EMPTY_CONNECTION_DETAILS_FORM_STATE,
  )
  const [pending, setPending] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const resetSession = React.useCallback(() => {
    setStep('entity')
    setSelectedEntityId(null)
    setSelectedRoleId(null)
    setDetailsState(EMPTY_CONNECTION_DETAILS_FORM_STATE)
    setPending(false)
    setSubmitError(null)
  }, [])

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (pending) return
      if (!nextOpen) resetSession()
      onOpenChange(nextOpen)
    },
    [onOpenChange, pending, resetSession],
  )

  const copy = sectionId ? resolveConnectionSheetEditCopy(sectionId) : null
  const personRoleOptions = PERSON_CONNECTION_ROLE_OPTIONS
  const placeRoleOptions = PLACE_CONNECTION_ROLE_OPTIONS
  const propertyRoleOptions = PROPERTY_CONNECTION_ROLE_OPTIONS
  const selectedPersonRole = personRoleOptions.find((role) => role.id === selectedRoleId)
  const selectedPlaceRole = placeRoleOptions.find((role) => role.id === selectedRoleId)
  const selectedPropertyRole = propertyRoleOptions.find((role) => role.id === selectedRoleId)

  const roleOptions = !sectionId
    ? []
    : sectionId === 'people'
      ? personRoleOptions
      : sectionId === 'places'
        ? placeRoleOptions
        : sectionId === 'property'
          ? propertyRoleOptions
          : []

  const needsRelationshipStep =
    sectionId !== null && sectionId !== 'organizations' && roleOptions.length > 1
  const selectedRowKind =
    sectionId === 'organizations'
      ? 'organizationMembership'
      : sectionId === 'people'
        ? selectedPersonRole?.kind
        : sectionId === 'places'
          ? selectedPlaceRole?.kind
          : selectedPropertyRole?.kind

  // fallow-ignore-next-line complexity
  const commitAdd = React.useCallback(async () => {
    if (!sectionId || !selectedEntityId || pending) return

    setPending(true)
    setSubmitError(null)

    try {
      if (sectionId === 'people' && selectedPersonRole) {
        await onAddPerson(selectedEntityId, selectedPersonRole)
      } else if (sectionId === 'organizations') {
        const organization = sheetData.organizationsById.get(selectedEntityId)
        const metadata = resolveOrganizationMembershipMetadata({
          titles: organization?.members?.titles ?? [],
          selectedTitle: titleFromMembershipRadioValue(detailsState.membershipTitle),
        })
        await onAddOrganization(selectedEntityId, metadata.title, metadata.priority)
      } else if (sectionId === 'places' && selectedPlaceRole) {
        if (selectedPlaceRole.kind === 'resides_at') {
          const eligibleResidenceIds = new Set(
            sheetData.eligibleResidenceLocations.map((location) => location.id),
          )
          if (!eligibleResidenceIds.has(selectedEntityId)) {
            throw new Error('This location cannot be used as a residence.')
          }
        }

        const details =
          selectedPlaceRole.kind === 'resides_at'
            ? buildConnectionDetailsPatch('resides_at', detailsState)
            : undefined
        await onAddPlace(selectedEntityId, selectedPlaceRole, details)
      } else if (sectionId === 'property' && selectedPropertyRole) {
        await onAddProperty(selectedEntityId, selectedPropertyRole)
      }

      handleOpenChange(false)
    } catch (error) {
      setSubmitError(resolveSubmitError(error, 'Could not add this connection.'))
    } finally {
      setPending(false)
    }
  }, [
    detailsState,
    handleOpenChange,
    onAddOrganization,
    onAddPerson,
    onAddPlace,
    onAddProperty,
    pending,
    sectionId,
    selectedEntityId,
    selectedPersonRole,
    selectedPlaceRole,
    selectedPropertyRole,
    sheetData.organizationsById,
  ])

  const handleEntitySelect = (entityId: string) => {
    setSelectedEntityId(entityId)
    if (sectionId === 'organizations') {
      setStep('details')
      return
    }

    if (needsRelationshipStep) {
      setStep('relationship')
      return
    }

    if (roleOptions.length === 1) {
      setSelectedRoleId(roleOptions[0]?.id ?? null)
    }

    setStep('details')
  }

  if (!sectionId || !copy) return null

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Content size="md" aria-describedby="character-connection-add-description">
        <Modal.Header headline={copy.addModalTitle} />
        <Modal.Body id="character-connection-add-description">
          {step === 'entity' ? (
            <ConnectionEntityPicker
              items={
                sectionId === 'people'
                  ? sheetData.campaignCharacterOptions.map((character) => {
                      const summary = buildCharacterPickerOptionEntitySummary(character)
                      return {
                        item: character.id,
                        key: character.id,
                        searchText: buildCharacterPickerOptionSearchText(character),
                        surface: {
                          identity: buildCharacterEntityCardModel(summary, {
                            includeCharacterTypeInMetadata: true,
                          }),
                          inlineAction: {
                            label: 'Select',
                            onClick: () => undefined,
                          },
                        },
                      }
                    })
                  : sectionId === 'organizations'
                    ? filterAndSortOrganizationPickerItems(
                        sheetData.availableOrganizations.map((organization) => ({
                          organization,
                          selected: existingProjectionKinds.has(organization.id),
                        })),
                        { searchQuery: '', domain: 'all' },
                      ).map(({ organization, selected }) => ({
                        item: organization.id,
                        key: organization.id,
                        searchText: getOrganizationPickerSearchText(organization),
                        surface: {
                          identity: buildOrganizationEntityCardModel(
                            buildOrganizationEntitySummaryVm(organization),
                          ),
                          inlineAction: {
                            label: 'Select',
                            onClick: () => undefined,
                            disabled: selected,
                          },
                        },
                      }))
                    : sectionId === 'places'
                      ? sheetData.allLocations.map((location) => ({
                          item: location.id,
                          key: location.id,
                          searchText: location.name,
                          surface: {
                            identity: buildLocationEntityCardModelFromClassification({
                              name: location.name,
                              classificationText:
                                resolveLocationClassificationDisplay(location).text,
                              displayImage: getContentDisplayImage(
                                buildLocationContentDisplayImageInput(
                                  {
                                    media: location.media,
                                    slug: location.slug,
                                    source: location.source,
                                    rulesetId: location.rulesetId,
                                  },
                                  'compact',
                                ),
                              ),
                            }),
                            inlineAction: {
                              label: 'Select',
                              onClick: () => undefined,
                            },
                          },
                        }))
                      : sheetData.eligiblePropertyLocations.map((location) => ({
                          item: location.id,
                          key: location.id,
                          searchText: location.name,
                          surface: {
                            identity: buildLocationEntityCardModelFromClassification({
                              name: location.name,
                              classificationText:
                                resolveLocationClassificationDisplay(location).text,
                              displayImage: getContentDisplayImage(
                                buildLocationContentDisplayImageInput(
                                  {
                                    media: location.media,
                                    slug: location.slug,
                                    source: location.source,
                                    rulesetId: location.rulesetId,
                                  },
                                  'compact',
                                ),
                              ),
                            }),
                            inlineAction: {
                              label: 'Select',
                              onClick: () => undefined,
                            },
                          },
                        }))
              }
              searchPlaceholder={
                sectionId === 'people'
                  ? 'Search characters'
                  : sectionId === 'organizations'
                    ? 'Search organizations'
                    : 'Search locations'
              }
              noResultsMessage={
                sectionId === 'organizations'
                  ? ORGANIZATION_PICKER_NO_RESULTS_MESSAGE
                  : 'No matches found.'
              }
              noItemsMessage={
                sectionId === 'organizations'
                  ? ORGANIZATION_PICKER_NO_ITEMS_MESSAGE
                  : 'No items are available.'
              }
              onSelect={handleEntitySelect}
            />
          ) : null}

          {step === 'relationship' ? (
            <div className="flex flex-col gap-4">
              <SelectField
                id="connection-add-relationship"
                label="Relationship"
                value={selectedRoleId ?? ''}
                onValueChange={setSelectedRoleId}
                options={roleOptions.map((role) => ({
                  value: role.id,
                  label: role.label,
                }))}
              />
            </div>
          ) : null}

          {step === 'details' && selectedRowKind ? (
            <ConnectionDetailsFields
              rowKind={selectedRowKind}
              organizationId={
                sectionId === 'organizations' ? (selectedEntityId ?? undefined) : undefined
              }
              sheetData={sheetData}
              state={detailsState}
              onStateChange={setDetailsState}
            />
          ) : null}

          {submitError ? (
            <Text variant="destructive" role="alert">
              {submitError}
            </Text>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Modal.FooterActions>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            {step !== 'entity' ? (
              <Button
                type="button"
                disabled={
                  pending ||
                  (step === 'relationship' && !selectedRoleId) ||
                  (step === 'details' &&
                    sectionId !== 'organizations' &&
                    needsRelationshipStep &&
                    !selectedRoleId)
                }
                onClick={() => {
                  if (step === 'relationship') {
                    setStep('details')
                    return
                  }
                  void commitAdd()
                }}
              >
                {step === 'relationship' ? 'Continue' : 'Add'}
              </Button>
            ) : null}
          </Modal.FooterActions>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
