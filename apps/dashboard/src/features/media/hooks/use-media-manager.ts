import { useCallback, useMemo, useReducer, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import {
  getContentMediaPolicy,
  validateContentMedia,
  type MediaAsset,
  type MediaRole,
} from '@rpg/contracts'
import { fetchMediaAsset } from '../api/media-api'
import { useMediaUploads } from './use-media-uploads'
import { createMediaSession, isMediaSessionDirty, mediaSessionReducer } from '../lib/media-session'
import { mediaErrorMessage } from '../lib/media-display'
import type { MediaManagerProps } from '../lib/media-manager.types'
const EMPTY_ASSETS: MediaAsset[] = []
export function useMediaManager({
  onOpenChange,
  domain,
  value,
  scope,
  initialAssets = EMPTY_ASSETS,
  onSave,
}: MediaManagerProps) {
  const policy = getContentMediaPolicy(domain)
  const [state, dispatch] = useReducer(mediaSessionReducer, value, createMediaSession)
  const [uploaded, setUploaded] = useState<Record<string, MediaAsset>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState<{
    title: string
    description: string
    action: () => void
  } | null>(null)
  const knownAssets = useMemo(
    () => ({ ...Object.fromEntries(initialAssets.map((asset) => [asset.id, asset])), ...uploaded }),
    [initialAssets, uploaded],
  )
  const queries = useQueries({
    queries: state.media.images.map((image) => ({
      queryKey: ['media-asset', image.assetId],
      queryFn: () => fetchMediaAsset(image.assetId),
      initialData: knownAssets[image.assetId],
      staleTime: Infinity,
    })),
  })
  const assets: Record<string, MediaAsset> = { ...knownAssets }
  queries.forEach((query) => {
    if (query.data) assets[query.data.id] = query.data
  })
  const uploads = useMediaUploads(scope, state.media.images.length, (asset, id) => {
    setUploaded((previous) => ({ ...previous, [asset.id]: asset }))
    dispatch({ type: 'add', asset, id })
  })
  const dirty = isMediaSessionDirty(state) || uploads.entries.length > 0
  const selected = state.media.images.find((image) => image.id === state.selectedId)
  const asset = selected ? assets[selected.assetId] : undefined
  const validation = validateContentMedia(state.media, { policy, assetDimensionsById: assets })
  const metadataReady = state.media.images.every((image) => Boolean(assets[image.assetId]))
  const label = domain === 'equipment' ? 'equipment item' : domain
  const onAlt = useCallback(
    (alt: string) => {
      if (state.selectedId) dispatch({ type: 'alt', id: state.selectedId, alt })
    },
    [state.selectedId, dispatch],
  )
  function dismiss() {
    if (saving) return
    if (!dirty) {
      onOpenChange(false)
      return
    }
    setConfirm({
      title: 'Discard image changes?',
      description:
        'All changes in this image session will be discarded. Uploaded originals remain temporary until attached to a saved record.',
      action: () => onOpenChange(false),
    })
  }
  function changeRole(role: MediaRole, assigned: boolean) {
    if (!selected) return
    const apply = () => dispatch({ type: 'role', id: selected.id, role, assigned })
    const previous = state.media.roles[role]
    if (previous?.presentation && (!assigned || previous.imageId !== selected.id)) {
      setConfirm({
        title: 'Discard customized presentation?',
        description:
          'This role change removes its current crop. The destination starts with its default presentation.',
        action: apply,
      })
    } else apply()
  }
  function remove() {
    if (!selected) return
    const roles = policy.allowedRoles.filter(
      (role) => state.media.roles[role]?.imageId === selected.id,
    )
    const action = () => dispatch({ type: 'remove', id: selected.id })
    if (roles.length)
      setConfirm({
        title: `Remove from this ${label}?`,
        description: `${asset?.filename ?? 'This image'} will be removed and ${roles.join(' and ')} cleared when changes are saved. The original is not immediately deleted.`,
        action,
      })
    else action()
  }
  const blocked = saving || !validation.ok || !metadataReady || uploads.entries.length > 0 || !dirty
  async function save() {
    if (blocked) return
    setSaving(true)
    setError('')
    try {
      await onSave({
        media: structuredClone(state.media),
        expectedMediaRevision: state.initial.revision,
        assets: Object.values(assets),
      })
      onOpenChange(false)
    } catch (failure) {
      setError(mediaErrorMessage(failure))
    } finally {
      setSaving(false)
    }
  }

  return {
    policy,
    state,
    dispatch,
    assets,
    saving,
    error,
    confirm,
    setConfirm,
    queries,
    uploads,
    selected,
    asset,
    validation,
    label,
    onAlt,
    dismiss,
    changeRole,
    remove,
    save,
    blocked,
  }
}
export type MediaManagerController = ReturnType<typeof useMediaManager>
