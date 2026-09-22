import * as React from 'react'

import { resolveLocationClassificationDisplay } from '@rpg/contracts'
import { Button, CatalogPickerSelectionActions, Text } from '@rpg/ui'

import {
  CatalogEntityPickerSheet,
  CatalogEntityRow,
  CatalogMetadataRenderer,
} from '@/features/content'

import { filterAndSortResidencePickerItems } from './residence-location-picker-drawer.lib'
import {
  RESIDENCE_PICKER_DESCRIPTION,
  RESIDENCE_PICKER_NO_ITEMS_MESSAGE,
  RESIDENCE_PICKER_NO_RESULTS_MESSAGE,
  RESIDENCE_PICKER_TITLE,
  type ResidenceLocationPickerDrawerProps,
} from './residence-location-picker-drawer.types'

export type { ResidenceLocationPickerDrawerProps } from './residence-location-picker-drawer.types'

const RESIDENCE_PICKER_SUBMIT_FAILED_MESSAGE = 'Could not add this residence.'

export function ResidenceLocationPickerDrawer({
  open,
  onOpenChange,
  items,
  onAdd,
}: ResidenceLocationPickerDrawerProps) {
  const [pending, setPending] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (pending) return
      if (!nextOpen) setSubmitError(null)
      onOpenChange(nextOpen)
    },
    [onOpenChange, pending],
  )

  const transformVisibleItems = React.useCallback(
    (visibleItems: readonly (typeof items)[number][], context: { searchQuery: string }) =>
      filterAndSortResidencePickerItems(visibleItems, { searchQuery: context.searchQuery }),
    [],
  )

  const commitResidence = React.useCallback(
    async (locationId: string) => {
      if (pending) return

      setPending(true)
      setSubmitError(null)
      try {
        await onAdd({ locationId })
        onOpenChange(false)
      } catch (error) {
        const message =
          error instanceof Error && error.message.trim().length > 0
            ? error.message
            : RESIDENCE_PICKER_SUBMIT_FAILED_MESSAGE
        setSubmitError(message)
      } finally {
        setPending(false)
      }
    },
    [onAdd, onOpenChange, pending],
  )

  return (
    <CatalogEntityPickerSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={RESIDENCE_PICKER_TITLE}
      description={RESIDENCE_PICKER_DESCRIPTION}
      items={items}
      getItemKey={({ location }) => location.id}
      getItemToolbarLabel={({ location }) => location.name}
      getSearchText={({ location }) => location.name}
      searchPlaceholder="Search locations"
      noResultsMessage={RESIDENCE_PICKER_NO_RESULTS_MESSAGE}
      noItemsMessage={RESIDENCE_PICKER_NO_ITEMS_MESSAGE}
      transformVisibleItems={transformVisibleItems}
      renderEntityRow={(args) => {
        const { location, selected } = args.item
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
                  lines={[
                    {
                      segments: [{ type: 'text', text: classification.text }],
                    },
                  ]}
                />
              ) : undefined,
              status: selected ? [{ kind: 'badge', label: 'Added', tone: 'success' }] : undefined,
            }}
            trailing={
              selected
                ? undefined
                : {
                    kind: 'action',
                    content: (
                      <CatalogPickerSelectionActions
                        canSelect
                        onAdd={() => {
                          void commitResidence(location.id)
                        }}
                        onRemove={() => undefined}
                      />
                    ),
                  }
            }
          />
        )
      }}
      renderItemDetails={({ location, selected }) => {
        if (selected) return null

        return (
          <div className="flex flex-col gap-4">
            {submitError ? (
              <Text variant="destructive" role="alert">
                {submitError}
              </Text>
            ) : null}
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={pending}
                onClick={() => {
                  void commitResidence(location.id)
                }}
              >
                Add residence
              </Button>
            </div>
          </div>
        )
      }}
    />
  )
}
