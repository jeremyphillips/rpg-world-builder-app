import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import {
  getContentMediaPolicy,
  validateContentMedia,
  type ContentMedia,
  type MediaAsset,
  type MediaRole,
} from '@rpg/contracts'
import { useToastScope } from '@rpg/ui'
import { fetchMediaAsset } from '../api/media-api'
import { useMediaUploads } from './use-media-uploads'
import {
  createMediaSession,
  hasNewMediaUploads,
  isMediaSessionDirty,
  mediaSessionReducer,
  resolvePostRemovalSelection,
} from '../lib/media-session'
import { mediaErrorMessage, mediaImageUrl } from '../lib/media-display'
import {
  MEDIA_MANAGER_TOAST_IDS,
  resolveMediaRemovedToastDuration,
  resolveMediaUploadLimitToastMessage,
} from '../lib/media-manager-toast.lib'
import {
  resolveMediaRoleConfirmCopy,
  shouldConfirmMediaRoleChange,
} from '../lib/media-role-confirm.lib'
import type { MediaManagerProps } from '../lib/media-manager.types'

const EMPTY_ASSETS: MediaAsset[] = []

type MediaManagerConfirm = {
  title: string
  description: string
  cancelLabel: string
  confirmLabel: string
  confirmVariant: 'default' | 'destructive'
  action: () => void
}

type RemovedImageSnapshot = {
  image: ContentMedia['images'][number]
  index: number
  roles: Partial<Record<MediaRole, NonNullable<ContentMedia['roles'][MediaRole]>>>
  fallbackSelectedId?: string
}

export function useMediaManager({
  onOpenChange,
  domain,
  value,
  scope,
  initialAssets = EMPTY_ASSETS,
  initialSelectedImageId,
  maxItems,
  onSave,
}: MediaManagerProps) {
  const toast = useToastScope()
  const policy = getContentMediaPolicy(domain)
  const allowedRoles = policy.allowedRoles
  const [state, dispatch] = useReducer(mediaSessionReducer, undefined, () =>
    createMediaSession(value, initialSelectedImageId, allowedRoles),
  )
  const [uploaded, setUploaded] = useState<Record<string, MediaAsset>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState<MediaManagerConfirm | null>(null)
  const removedSnapshot = useRef<RemovedImageSnapshot | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state
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

  const addAsset = useCallback(
    (asset: MediaAsset, id: string) => {
      if (state.media.images.some((image) => image.assetId === asset.id)) {
        toast.toast({
          id: MEDIA_MANAGER_TOAST_IDS.duplicate,
          title: 'This image is already here.',
        })
        return
      }
      setUploaded((previous) => ({ ...previous, [asset.id]: asset }))
      dispatch({ type: 'add', asset, id })
    },
    [state.media.images, toast],
  )

  const uploads = useMediaUploads(
    scope,
    state.media.images.length,
    addAsset,
    maxItems,
    (remaining) => {
      toast.toast({
        id: MEDIA_MANAGER_TOAST_IDS.uploadLimit,
        title: resolveMediaUploadLimitToastMessage(remaining),
        tone: 'warning',
      })
    },
  )

  useEffect(() => {
    return () => {
      toast.dismissAll()
    }
  }, [toast])

  useEffect(() => {
    if (error) {
      toast.toast({
        id: MEDIA_MANAGER_TOAST_IDS.saveError,
        title: error,
        tone: 'destructive',
        duration: 'persistent',
      })
    } else {
      toast.dismiss(MEDIA_MANAGER_TOAST_IDS.saveError)
    }
  }, [error, toast])

  const dirty = isMediaSessionDirty(state) || uploads.entries.length > 0
  const selected = state.media.images.find((image) => image.id === state.selectedId)
  const asset = selected ? assets[selected.assetId] : undefined
  const validation = validateContentMedia(state.media, {
    policy,
    assetDimensionsById: assets,
    maxItems,
  })
  const metadataReady = state.media.images.every((image) => Boolean(assets[image.assetId]))
  const label = domain === 'equipment' ? 'equipment item' : domain
  const onAlt = useCallback(
    (alt: string) => {
      if (state.selectedId) dispatch({ type: 'alt', id: state.selectedId, alt })
    },
    [state.selectedId],
  )

  function notifyRejectedDrop(message: string) {
    toast.toast({
      id: MEDIA_MANAGER_TOAST_IDS.dropRejected,
      title: message,
      tone: 'warning',
    })
  }

  function dismiss() {
    if (saving) return
    if (!dirty) {
      toast.dismissAll()
      onOpenChange(false)
      return
    }
    const description = hasNewMediaUploads(state)
      ? `Changes to images, roles, and presentation won't be saved. New images added here won't be attached to this ${label}.`
      : "Changes to images, roles, and presentation won't be saved."
    setConfirm({
      title: 'Discard image changes?',
      description,
      cancelLabel: 'Keep editing',
      confirmLabel: 'Discard changes',
      confirmVariant: 'destructive',
      action: () => {
        toast.dismissAll()
        onOpenChange(false)
      },
    })
  }

  function changeRole(role: MediaRole, assigned: boolean) {
    if (!selected) return
    const source = asset ? { width: asset.orientedWidth, height: asset.orientedHeight } : undefined
    const apply = () =>
      dispatch({
        type: 'role',
        id: selected.id,
        role,
        assigned,
        allowedRoles,
        source,
      })
    const confirmation = shouldConfirmMediaRoleChange({
      role,
      assigned,
      selectedId: selected.id,
      media: state.media,
      assets,
      source,
    })
    if (confirmation.required) {
      const copy = resolveMediaRoleConfirmCopy(role, confirmation.mode)
      setConfirm({
        title: copy.title,
        description: copy.description,
        cancelLabel: 'Cancel',
        confirmLabel: copy.confirmLabel,
        confirmVariant: 'destructive',
        action: apply,
      })
      return
    }
    apply()
  }

  function restoreRemovedImage() {
    const snapshot = removedSnapshot.current
    if (!snapshot) return
    dispatch({
      type: 'restoreRemoved',
      image: snapshot.image,
      index: snapshot.index,
      roles: snapshot.roles,
      restoreSelection: stateRef.current.selectedId === snapshot.fallbackSelectedId,
      allowedRoles,
    })
    removedSnapshot.current = null
    toast.dismiss(MEDIA_MANAGER_TOAST_IDS.imageRemoved)
  }

  function remove() {
    if (!selected || !asset) return
    const index = state.media.images.findIndex((image) => image.id === selected.id)
    const remainingImages = state.media.images.filter((image) => image.id !== selected.id)
    const fallbackSelectedId = resolvePostRemovalSelection(remainingImages, index)
    const roles = Object.fromEntries(
      allowedRoles
        .filter((role) => state.media.roles[role]?.imageId === selected.id)
        .map((role) => [role, structuredClone(state.media.roles[role]!)]),
    ) as RemovedImageSnapshot['roles']

    removedSnapshot.current = {
      image: structuredClone(selected),
      index,
      roles,
      fallbackSelectedId,
    }

    dispatch({ type: 'remove', id: selected.id, allowedRoles })

    toast.toast({
      id: MEDIA_MANAGER_TOAST_IDS.imageRemoved,
      title: 'Image removed',
      duration: resolveMediaRemovedToastDuration(),
      leading: (
        <img
          className="size-10 rounded-md object-cover"
          src={mediaImageUrl(asset.id, 'gallery-thumbnail')}
          alt=""
        />
      ),
      action: {
        label: 'Undo',
        variant: 'text',
        onClick: restoreRemovedImage,
      },
      onDismiss: () => {
        removedSnapshot.current = null
      },
    })
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
      removedSnapshot.current = null
      toast.dismiss(MEDIA_MANAGER_TOAST_IDS.imageRemoved)
      toast.dismissAll()
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
    notifyRejectedDrop,
  }
}

export type MediaManagerController = ReturnType<typeof useMediaManager>
