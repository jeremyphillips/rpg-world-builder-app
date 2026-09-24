import type { ContentMediaValidationResult } from '@rpg/contracts'
import type { MediaStatusNotice } from '../lib/media-notice.lib'
import { mediaManagerStyles as styles } from './media-manager.variants'
import { MediaStatusNotice as MediaStatusNoticeContent } from './media-status-notice'

export function MediaManagerStatus({
  statusNotice,
  pendingUploadCount,
  validation,
  error,
}: {
  statusNotice?: MediaStatusNotice | null
  pendingUploadCount: number
  validation: ContentMediaValidationResult
  error?: string
}) {
  return (
    <div className={styles.status()}>
      {statusNotice ? (
        <p
          role="status"
          className={styles.muted()}
          aria-label={
            statusNotice.kind === 'image-added'
              ? `${statusNotice.filename} added. Assign a role to use it as representative artwork.`
              : undefined
          }
        >
          <MediaStatusNoticeContent notice={statusNotice} />
        </p>
      ) : null}
      {pendingUploadCount > 0 && (
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
          {error} Your draft has been preserved. Cancel to discard and reopen with the latest record
          if it changed elsewhere.
        </p>
      )}
    </div>
  )
}
