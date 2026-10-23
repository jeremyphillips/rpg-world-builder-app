import {
  borderStrength,
  Button,
  cn,
  DialogPanelScrollRegion,
  FileDropzone,
  resolveChromeCalloutClasses,
  resolveImageDropTargetDefaults,
  SegmentedControl,
  Text,
  type ScrollBoundaryState,
} from '@rpg/ui'
import { Info } from 'lucide-react'
import { mediaRoleSurfaceCopy, type MediaRole } from '@rpg/contracts'
import type { UseQueryResult } from '@tanstack/react-query'

import type { MediaManagerController } from '../../hooks/use-media-manager'
import { mediaImageUrl } from '../../lib/media-display'
import { MediaWorkspaceSelection } from './media-workspace-selection'
import { resolveMediaWorkspaceCopy, resolveMediaWorkspaceOnboarding } from './media-workspace.lib'

function MediaWorkspaceErrorAlert({
  queries,
}: {
  queries: Array<Pick<UseQueryResult, 'isError' | 'refetch'>>
}) {
  if (!queries.some((query) => query.isError)) {
    return null
  }

  return (
    <div role="alert">
      <p>Image details could not be loaded.</p>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          queries.forEach((query) => {
            if (query.isError) void query.refetch()
          })
        }}
      >
        Retry image details
      </Button>
    </div>
  )
}

function MediaWorkspaceHeader({
  copy,
  assignedRoles,
  presentation,
  onPresentationChange,
}: {
  copy: { heading: string; description: string }
  assignedRoles: readonly MediaRole[]
  presentation: MediaRole
  onPresentationChange: (role: MediaRole) => void
}) {
  return (
    <div className="mb-4 shrink-0 space-y-1">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{copy.heading}</h2>
        {assignedRoles.length >= 2 ? (
          <SegmentedControl
            value={presentation}
            options={assignedRoles.map((role) => ({
              value: role,
              label: mediaRoleSurfaceCopy[role].switchLabel,
            }))}
            onValueChange={onPresentationChange}
            segmentWidth="auto"
            size="sm"
            aria-label="Presentation"
          />
        ) : null}
      </div>
      <Text variant="supporting">{copy.description}</Text>
    </div>
  )
}

export function MediaWorkspace({
  controller,
  imageUrl = mediaImageUrl,
  onScrollBoundaryChange,
}: {
  controller: MediaManagerController
  imageUrl?: typeof mediaImageUrl
  onScrollBoundaryChange?: (state: ScrollBoundaryState) => void
}) {
  const { state, selectedAvailable, asset, queries, policy, uploads, dispatch, label } = controller
  const assignedRoles = controller.assignedRolesForSelection
  const copy = resolveMediaWorkspaceCopy({
    presentation: state.presentation,
    assignedRoles,
    hasSelection: Boolean(selectedAvailable),
    label,
  })

  return (
    <section
      className={cn(
        'media-manager__column media-manager__column--separated',
        borderStrength('subtle'),
      )}
      aria-label="Image preview"
    >
      <DialogPanelScrollRegion
        inset="innerLeading"
        regionClassName="media-manager__column-scroll"
        viewportClassName="media-manager__column-viewport"
        showTopBoundaryShadow={false}
        showBottomBoundaryShadow={false}
        onBoundaryStateChange={onScrollBoundaryChange}
      >
        <MediaWorkspaceHeader
          copy={copy}
          assignedRoles={assignedRoles}
          presentation={state.presentation}
          onPresentationChange={(role) => dispatch({ type: 'presentation', role })}
        />
        <div className="flex min-h-0 flex-1 flex-col">
          {selectedAvailable ? (
            <MediaWorkspaceSelection
              controller={controller}
              imageUrl={imageUrl}
              selectedAvailable={selectedAvailable}
              asset={asset}
              assignedRoles={assignedRoles}
              interaction={copy.interaction}
            />
          ) : (
            <>
              <div className="flex min-h-48 flex-1 items-stretch">
                <FileDropzone
                  {...resolveImageDropTargetDefaults(
                    uploads.maxUploadBytes !== undefined
                      ? { maxUploadBytes: uploads.maxUploadBytes }
                      : { includeMaxSize: false },
                  )}
                  className="h-full"
                  multiple
                  dropTarget={false}
                  onChange={(files) => uploads.add(files)}
                />
              </div>
              <div
                className={cn(
                  'mt-4 shrink-0',
                  resolveChromeCalloutClasses({ variant: 'callout', tone: 'info' }),
                )}
              >
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <p className="text-sm">{resolveMediaWorkspaceOnboarding(policy.domain)}</p>
                </div>
              </div>
            </>
          )}
        </div>
        <MediaWorkspaceErrorAlert queries={queries} />
      </DialogPanelScrollRegion>
    </section>
  )
}
