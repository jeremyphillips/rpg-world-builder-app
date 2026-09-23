import { Button, ConfirmDialog, Modal } from '@rpg/ui'
import { useMediaManager } from '../hooks/use-media-manager'
import { useMediaManagerBodyDrop } from '../hooks/use-media-manager-body-drop'
import { useMediaManagerScrollBoundary } from '../hooks/use-media-manager-scroll-boundary'
import type { MediaManagerProps } from '../lib/media-manager.types'
import { MediaManagerBody } from './media-manager-body'
import {
  resolveMediaManagerBodyDropOverlay,
  resolveMediaManagerFooterHint,
  shouldShowMediaManagerStatus,
} from './media-manager-session.lib'
import { MediaManagerStatus } from './media-manager-status'
import { mediaManagerStyles as styles } from './media-manager.variants'

export type { MediaManagerProps, MediaManagerSave } from '../lib/media-manager.types'

/** Mount one isolated session per opening; parent refreshes never overwrite a draft. */
export function MediaManager(props: MediaManagerProps) {
  return props.open ? <MediaManagerSession {...props} /> : null
}

function MediaManagerSession(props: MediaManagerProps) {
  const controller = useMediaManager(props)
  const {
    state,
    dispatch,
    assets,
    saving,
    error,
    confirm,
    setConfirm,
    uploads,
    validation,
    label,
    dismiss,
    save,
    blocked,
  } = controller
  const bodyDrop = useMediaManagerBodyDrop({
    onAdd: uploads.add,
    onReject: uploads.notify,
    maxUploadBytes: uploads.maxUploadBytes,
  })
  const { headerScrolled, onGalleryBoundaryChange, onWorkspaceBoundaryChange } =
    useMediaManagerScrollBoundary()
  const bodyDropOverlay = resolveMediaManagerBodyDropOverlay(props.previewBodyDrop, bodyDrop)
  const statusNotice = uploads.notice || state.notice
  const showStatus = shouldShowMediaManagerStatus({
    statusNotice,
    pendingUploadCount: uploads.entries.length,
    validationOk: validation.ok,
    error,
  })

  return (
    <Modal.Root
      open
      onOpenChange={(open) => {
        if (!open) dismiss()
      }}
    >
      <Modal.Content size="media" layout="stable" stableSize="tall">
        <Modal.Header
          className={styles.header()}
          headline="Manage images"
          description={`Add, organize, and assign images for this ${label}.`}
        >
          <div aria-hidden data-visible={headerScrolled} className={styles.headerScrollShadow()} />
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
            onSelect={(id) => dispatch({ type: 'select', id })}
            onGalleryBoundaryChange={onGalleryBoundaryChange}
            onWorkspaceBoundaryChange={onWorkspaceBoundaryChange}
          />
          {showStatus ? (
            <MediaManagerStatus
              statusNotice={statusNotice}
              pendingUploadCount={uploads.entries.length}
              validation={validation}
              error={error}
            />
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <div className={styles.row()}>
            <p className={styles.muted()}>{resolveMediaManagerFooterHint(props.mode, label)}</p>
            <div className={styles.row()}>
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
          confirmLabel="Continue"
          onConfirm={() => {
            confirm?.action()
            setConfirm(null)
          }}
        />
      </Modal.Content>
    </Modal.Root>
  )
}
