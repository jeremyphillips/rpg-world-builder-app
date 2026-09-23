import { Button, ConfirmDialog, Modal } from '@rpg/ui'
import { useMediaManager } from '../hooks/use-media-manager'
import type { MediaManagerProps } from '../lib/media-manager.types'
import { MediaGallery } from './media-gallery'
import { MediaWorkspace } from './media-workspace'
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
  return (
    <Modal.Root
      open
      onOpenChange={(open) => {
        if (!open) dismiss()
      }}
    >
      <Modal.Content size="media" layout="stable" stableSize="tall">
        <Modal.Header
          headline="Manage images"
          description={`Add, organize, and assign images for this ${label}.`}
        />
        <Modal.Body>
          <fieldset disabled={saving} className={styles.layout()}>
            <MediaGallery
              imageUrl={props.imageUrl}
              media={state.media}
              assets={assets}
              selectedId={state.selectedId}
              entries={uploads.entries}
              onSelect={(id) => dispatch({ type: 'select', id })}
              onAdd={uploads.add}
              onRetry={uploads.retry}
              onRemoveUpload={uploads.remove}
            />
            <MediaWorkspace controller={controller} imageUrl={props.imageUrl} />
          </fieldset>
          <p role="status" className={styles.muted()}>
            {uploads.notice || state.notice}
          </p>
          {uploads.entries.length > 0 && (
            <p className={styles.muted()}>
              Finish uploads or remove pending/failed entries before saving.
            </p>
          )}
          {!validation.ok && (
            <p role="alert" className={styles.error()}>
              {validation.issues.map((issue) => issue.message).join(' ')}
            </p>
          )}
          {error && (
            <p role="alert" className={styles.error()}>
              {error} Your draft has been preserved. Cancel to discard and reopen with the latest
              record if it changed elsewhere.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className={styles.row()}>
            <p className={styles.muted()}>
              {props.mode === 'form'
                ? `Image changes are saved when you save this ${label}.`
                : 'Save changes to this record.'}
            </p>
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
