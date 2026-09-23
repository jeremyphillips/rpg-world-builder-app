import { useEffect, useRef, useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  CONTENT_MEDIA_MAX_ATTACHMENTS,
  CONTENT_MEDIA_MAX_UPLOADS_IN_FLIGHT,
  type MediaAsset,
  type MediaScope,
  type MediaUploadSession,
} from '@rpg/contracts'
import { createUploadSession, uploadMediaFile } from '../api/media-api'
import { mediaErrorMessage } from '../lib/media-display'

export type UploadEntry = {
  id: string
  file: File
  status: 'queued' | 'uploading' | 'failed' | 'ready'
  asset?: MediaAsset
  error?: string
}
export function useMediaUploads(
  scope: MediaScope,
  count: number,
  onAsset: (asset: MediaAsset, id: string) => void,
  maxItems = CONTENT_MEDIA_MAX_ATTACHMENTS,
) {
  const [entries, setEntries] = useState<UploadEntry[]>([])
  const [notice, setNotice] = useState('')
  const [maxUploadBytes, setMaxUploadBytes] = useState<number | undefined>(undefined)
  const queue = useRef<UploadEntry[]>([])
  const active = useRef(new Map<string, AbortController>())
  const alive = useRef(true)
  const callback = useRef(onAsset)
  callback.current = onAsset
  const session = useRef<Promise<MediaUploadSession> | undefined>(undefined)

  const ensureSession = useCallback(() => {
    session.current ??= createUploadSession(scope)
      .then((uploadSession) => {
        if (alive.current) setMaxUploadBytes(uploadSession.maxUploadBytes)
        return uploadSession
      })
      .catch((error) => {
        session.current = undefined
        throw error
      })
    return session.current
  }, [scope])
  useEffect(() => {
    void ensureSession()
  }, [ensureSession])

  const mutation = useMutation({
    mutationFn: async (entry: UploadEntry & { signal: AbortSignal }) => {
      const uploadSession = await ensureSession()
      if (Date.parse(uploadSession.expiresAt) <= Date.now())
        throw new Error('Upload session expired. Close and reopen Manage images to upload again.')
      if (entry.file.size > uploadSession.maxUploadBytes)
        throw new Error(
          `File exceeds the ${Math.floor(uploadSession.maxUploadBytes / 1024 / 1024)} MB limit.`,
        )
      return uploadMediaFile(uploadSession.id, entry.file, entry.id, entry.signal)
    },
  })
  useEffect(() => {
    alive.current = true
    const controllers = active.current
    return () => {
      alive.current = false
      controllers.forEach((controller) => controller.abort())
    }
  }, [])
  function publish() {
    if (alive.current) setEntries([...queue.current])
  }
  // Publish successes in chooser order, even when network responses arrive out of order.
  function flushCompleted() {
    for (const entry of [...queue.current]) {
      if (entry.status === 'queued' || entry.status === 'uploading') break
      if (entry.status === 'ready' && entry.asset) {
        callback.current(entry.asset, entry.id)
        queue.current = queue.current.filter((item) => item.id !== entry.id)
      }
    }
    publish()
  }
  function pump() {
    for (const entry of queue.current) {
      if (active.current.size >= CONTENT_MEDIA_MAX_UPLOADS_IN_FLIGHT) break
      if (entry.status !== 'queued') continue
      const controller = new AbortController()
      active.current.set(entry.id, controller)
      entry.status = 'uploading'
      void mutation
        .mutateAsync({ ...entry, signal: controller.signal })
        .then((result) => {
          if (!alive.current || controller.signal.aborted) return
          entry.status = 'ready'
          entry.asset = result.asset
        })
        .catch((error) => {
          if (!alive.current || controller.signal.aborted) return
          entry.status = 'failed'
          entry.error = mediaErrorMessage(error)
        })
        .finally(() => {
          active.current.delete(entry.id)
          if (alive.current) {
            flushCompleted()
            pump()
          }
        })
    }
    publish()
  }
  function add(files: File[]) {
    const remaining = Math.max(0, maxItems - count - queue.current.length)
    if (files.length > remaining)
      setNotice(`Only ${remaining} more images can be added (limit ${maxItems}).`)
    for (const file of files.slice(0, remaining))
      queue.current.push({ id: crypto.randomUUID(), file, status: 'queued' })
    pump()
  }
  function remove(id: string) {
    active.current.get(id)?.abort()
    queue.current = queue.current.filter((item) => item.id !== id)
    flushCompleted()
    pump()
  }
  function retry(id: string) {
    const entry = queue.current.find((item) => item.id === id)
    if (entry) {
      entry.status = 'queued'
      entry.error = undefined
      pump()
    }
  }
  function notify(message: string) {
    setNotice(message)
  }
  return { entries, notice, maxUploadBytes, add, remove, retry, notify }
}
