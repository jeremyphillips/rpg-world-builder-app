import { useEffect, useRef } from 'react'
import {
  Alert,
  Button,
  cn,
  ConfirmDialog,
  Modal,
  scrollBoundaryTopShadowClasses,
  Text,
  ToastScopeProvider,
} from '@rpg/ui'
import { formatFieldMessage } from '@rpg/contracts'
import { useMediaManager } from '../../hooks/use-media-manager'
import { useMediaManagerBodyDrop } from '../../hooks/use-media-manager-body-drop'
import { useMediaManagerScrollBoundary } from '../../hooks/use-media-manager-scroll-boundary'
import type { MediaManagerProps } from '../../lib/media-manager.types'
import { MediaManagerBody } from './media-manager-body'
import {
  resolveMediaManagerBodyDropOverlay,
  resolveMediaManagerFooterHint,
} from './media-manager-session.lib'

export type { MediaManagerProps, MediaManagerSave } from '../../lib/media-manager.types'

/** Mount one isolated session per opening; parent refreshes never overwrite a draft. */
export function MediaManager(props: MediaManagerProps) {
  return props.open ? <MediaManagerSession {...props} /> : null
}

function MediaManagerSession(props: MediaManagerProps) {
  const dismissRef = useRef<(() => void) | null>(null)

  return (
    <Modal.Root
      open
      onOpenChange={(open) => {
        if (!open) dismissRef.current?.()
      }}
    >
      <Modal.Content size="media" layout="stable" stableSize="tall">
        <ToastScopeProvider>
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <MediaManagerSessionContent {...props} dismissRef={dismissRef} />
          </div>
        </ToastScopeProvider>
      </Modal.Content>
    </Modal.Root>
  )
}

function MediaManagerSessionContent({
  dismissRef,
  ...props
}: MediaManagerProps & { dismissRef: React.MutableRefObject<(() => void) | null> }) {
  const controller = useMediaManager(props)
  const {
    state,
    dispatch,
    assets,
    saving,
    confirm,
    setConfirm,
    uploads,
    label,
    dismiss,
    save,
    blocked,
    validation,
    notifyRejectedDrop,
  } = controller
  useEffect(() => {
    dismissRef.current = dismiss
  }, [dismiss])

  const bodyDrop = useMediaManagerBodyDrop({
    onAdd: uploads.add,
    onReject: notifyRejectedDrop,
    maxUploadBytes: uploads.maxUploadBytes,
    disabled: controller.mutationsLocked,
  })
  const {
    headerScrolled,
    onGalleryBoundaryChange,
    onPreviewBoundaryChange,
    onDetailsBoundaryChange,
  } = useMediaManagerScrollBoundary()
  const bodyDropOverlay = resolveMediaManagerBodyDropOverlay(props.previewBodyDrop, bodyDrop)

  return (
    <>
      <Modal.Header
        className="media-manager__header"
        headline="Manage images"
        description={`Add, organize, and assign images for this ${label}.`}
      >
        <div
          aria-hidden
          data-visible={headerScrolled}
          className={cn(scrollBoundaryTopShadowClasses, 'top-full')}
        />
      </Modal.Header>
      <Modal.Body stableBody>
        <MediaManagerBody
          bodyDrop={bodyDrop}
          bodyDropOverlay={bodyDropOverlay}
          controller={controller}
          imageUrl={props.imageUrl}
          media={state.media}
          assets={assets}
          selectedId={state.selectedId}
          entries={uploads.entries}
          saving={saving}
          onSelect={(id) =>
            dispatch({ type: 'select', id, allowedRoles: controller.policy.allowedRoles })
          }
          onGalleryBoundaryChange={onGalleryBoundaryChange}
          onPreviewBoundaryChange={onPreviewBoundaryChange}
          onDetailsBoundaryChange={onDetailsBoundaryChange}
        />
      </Modal.Body>
      <Modal.Footer>
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
          <Text variant="caption">{resolveMediaManagerFooterHint(props.mode, label)}</Text>
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
            {!saving && !validation.ok && validation.issues.length > 0 ? (
              <Alert
                variant="warning"
                density="compact"
                description={`${formatFieldMessage(validation.issues[0]!.message)}${
                  validation.issues.length > 1 ? ` +${validation.issues.length - 1} more` : ''
                }`}
              />
            ) : null}
            <Button type="button" variant="outline" disabled={saving} onClick={dismiss}>
              Cancel
            </Button>
            <Button type="button" disabled={blocked} onClick={() => void save()}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      </Modal.Footer>
      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => {
          if (!open) setConfirm(null)
        }}
        headline={confirm?.title}
        description={confirm?.description}
        cancelLabel={confirm?.cancelLabel}
        confirmLabel={confirm?.confirmLabel}
        confirmVariant={confirm?.confirmVariant}
        onConfirm={() => {
          confirm?.action()
          setConfirm(null)
        }}
      />
    </>
  )
}
