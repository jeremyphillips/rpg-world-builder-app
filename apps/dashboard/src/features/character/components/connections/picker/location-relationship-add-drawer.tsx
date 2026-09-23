import * as React from 'react'

import { resolveLocationClassificationDisplay, type Location } from '@rpg/contracts'
import { Button, CatalogPickerSelectionActions, Eyebrow, Text } from '@rpg/ui'

import {
  CatalogEntityPickerSheet,
  CatalogEntityRow,
  CatalogMetadataRenderer,
} from '@/features/content'
import { DrawerShell } from '@/components/drawer'

import type {
  PlaceConnectionRoleOption,
  PropertyConnectionRoleOption,
} from '../../../lib/relationship/connection-role-catalog'
import { LocationRelationshipRoleStep } from './location-relationship-role-step'

type LocationRelationshipRoleOption = PlaceConnectionRoleOption | PropertyConnectionRoleOption

export type LocationRelationshipAddDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  locations: readonly Location[]
  roleOptions: readonly LocationRelationshipRoleOption[]
  presetRole?: LocationRelationshipRoleOption
  onAdd: (input: {
    locationId: string
    role: LocationRelationshipRoleOption
  }) => void | Promise<void>
}

function resolveSubmitError(error: unknown): string {
  return error instanceof Error && error.message.trim().length > 0
    ? error.message
    : 'Could not add this location connection.'
}

// Orchestrator: location picker → role selection → confirm for place/property edges.
// fallow-ignore-next-line complexity
export function LocationRelationshipAddDrawer({
  open,
  onOpenChange,
  title,
  locations,
  roleOptions,
  presetRole,
  onAdd,
}: LocationRelationshipAddDrawerProps) {
  const [selectedLocationId, setSelectedLocationId] = React.useState<string | null>(null)
  const [selectedRoleId, setSelectedRoleId] = React.useState<string | null>(presetRole?.id ?? null)
  const [pending, setPending] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const resetSession = React.useCallback(() => {
    setSelectedLocationId(null)
    setSelectedRoleId(presetRole?.id ?? null)
    setPending(false)
    setSubmitError(null)
  }, [presetRole?.id])

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (pending) return
      if (!nextOpen) resetSession()
      onOpenChange(nextOpen)
    },
    [onOpenChange, pending, resetSession],
  )

  const selectedLocation = locations.find((location) => location.id === selectedLocationId)
  const selectedRole = roleOptions.find((role) => role.id === selectedRoleId)
  const showRoleStep = Boolean(selectedLocationId) && !presetRole && roleOptions.length > 1
  const showConfirmStep = Boolean(selectedLocationId) && Boolean(presetRole ?? selectedRole)
  const pickerOpen = open && !showRoleStep && !showConfirmStep

  const commitAdd = React.useCallback(async () => {
    const role = presetRole ?? selectedRole
    if (!selectedLocationId || !role || pending) return

    setPending(true)
    setSubmitError(null)
    try {
      await onAdd({ locationId: selectedLocationId, role })
      onOpenChange(false)
    } catch (error) {
      setSubmitError(resolveSubmitError(error))
    } finally {
      setPending(false)
    }
  }, [onAdd, onOpenChange, pending, presetRole, selectedLocationId, selectedRole])

  const commitLocation = React.useCallback(
    async (locationId: string) => {
      if (roleOptions.length === 1) {
        const onlyRole = roleOptions[0]!
        setSelectedLocationId(locationId)
        await onAdd({ locationId, role: onlyRole })
        onOpenChange(false)
        return
      }

      setSelectedLocationId(locationId)
    },
    [onAdd, onOpenChange, roleOptions],
  )

  const pickerItems = locations.map((location) => ({ location, selected: false }))

  return (
    <>
      <CatalogEntityPickerSheet
        open={pickerOpen}
        onOpenChange={handleOpenChange}
        title={title}
        description="Choose a location connected to this character."
        items={pickerItems}
        getItemKey={({ location }) => location.id}
        getItemToolbarLabel={({ location }) => location.name}
        getSearchText={({ location }) => location.name}
        searchPlaceholder="Search locations"
        noResultsMessage="No locations match your search."
        noItemsMessage="No locations are available."
        renderEntityRow={(args) => {
          const { location } = args.item
          const classification = resolveLocationClassificationDisplay(location)

          return (
            <CatalogEntityRow
              toolbarLabel={args.toolbarLabel}
              domIds={args.domIds}
              collapsible={args.collapsible}
              collapsed={args.collapsed}
              onToggleCollapse={args.onToggleCollapse}
              summary={args.summary}
              details={args.details}
              entity={{
                heading: location.name,
                description: classification.text ? (
                  <CatalogMetadataRenderer
                    lines={[{ segments: [{ type: 'text', text: classification.text }] }]}
                  />
                ) : undefined,
              }}
              trailing={{
                kind: 'action',
                content: (
                  <CatalogPickerSelectionActions
                    canSelect
                    onAdd={() => {
                      void commitLocation(location.id)
                    }}
                    onRemove={() => undefined}
                  />
                ),
              }}
            />
          )
        }}
        renderItemDetails={({ location }) => (
          <div className="flex justify-end">
            <Button
              type="button"
              disabled={pending}
              onClick={() => {
                void commitLocation(location.id)
              }}
            >
              Continue
            </Button>
          </div>
        )}
      />
      <DrawerShell
        open={open && (showRoleStep || showConfirmStep)}
        onOpenChange={handleOpenChange}
        title={title}
      >
        <div className="flex flex-col gap-6">
          {selectedLocation ? (
            <div className="space-y-1">
              <Eyebrow size="sm">Location</Eyebrow>
              <Text>{selectedLocation.name}</Text>
            </div>
          ) : null}

          {presetRole ? (
            <div className="space-y-1">
              <Eyebrow size="sm">Relationship</Eyebrow>
              <Text>{presetRole.label}</Text>
            </div>
          ) : null}

          {showRoleStep ? (
            <LocationRelationshipRoleStep
              roleOptions={roleOptions}
              selectedRoleId={selectedRoleId}
              onSelectedRoleIdChange={setSelectedRoleId}
            />
          ) : null}

          {submitError ? (
            <Text variant="destructive" role="alert">
              {submitError}
            </Text>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending || !showConfirmStep || (!presetRole && !selectedRole)}
              onClick={() => {
                void commitAdd()
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </DrawerShell>
    </>
  )
}
