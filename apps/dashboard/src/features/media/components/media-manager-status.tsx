import type { ContentMediaValidationResult } from '@rpg/contracts'
import type { UploadEntry } from '../hooks/use-media-uploads'
import type { MediaStatusNotice } from '../lib/media-notice.lib'
import { mediaManagerStyles as styles } from './media-manager.variants'
import { MediaStatusNotice as MediaStatusNoticeContent } from './media-status-notice'

function resolveUploadingCount(entries: readonly UploadEntry[]): number {
  return entries.filter((entry) => entry.status === 'queued' || entry.status === 'uploading').length
}

function hasFailedUpload(entries: readonly UploadEntry[]): boolean {
  return entries.some((entry) => entry.status === 'failed')
}

export function MediaManagerStatus({
  statusNotice,
  entries,
  validation,
  error,
}: {
  statusNotice?: MediaStatusNotice | null
  entries: readonly UploadEntry[]
  validation: ContentMediaValidationResult
  error?: string
}) {
  const uploadingCount = resolveUploadingCount(entries)
  const failedUpload = hasFailedUpload(entries)

  return (
    <div className={styles.status()}>
      {statusNotice ? (
        <p role="status" className={styles.muted()}>
          <MediaStatusNoticeContent notice={statusNotice} />
        </p>
      ) : null}
      {uploadingCount > 0 ? (
        <p className={styles.muted()}>
          Uploading {uploadingCount} {uploadingCount === 1 ? 'image' : 'images'}…
        </p>
      ) : null}
      {failedUpload ? (
        <p role="alert" className={styles.error()}>
          Upload failed. Try again.
        </p>
      ) : null}
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
