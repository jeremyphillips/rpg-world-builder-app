import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import {
  getAvailableContentImages,
  getContentMediaPolicy,
  normalizePersistedContentMedia,
  resolveEffectiveImageRoles,
  roleAssignmentMatchesImageId,
  validateContentMedia,
  type AvailableContentImage,
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
  isRemovableMediaSelection,
  mediaSessionReducer,
  resolvePostRemovalSelection,
  type DeriveAvailableImages,
  type MediaAction,
} from '../lib/media-session'
import { mediaErrorMessage, mediaImageUrl, systemContentImageUrl } from '../lib/media-display'
import {
  MEDIA_MANAGER_TOAST_IDS,
  resolveMediaRemovedToastDuration,
  resolveMediaRemovedToastId,
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
  toastId: string
  image: ContentMedia['images'][number]
  index: number
  roles: Partial<Record<MediaRole, NonNullable<ContentMedia['roles'][MediaRole]>>>
  fallbackSelectedId?: string
}

function resolveAvailableImages(
  value: ContentMedia,
  contentContext: MediaManagerProps['contentContext'],
): AvailableContentImage[] {
  if (!contentContext) {
    return value.images.map((attachment) => ({
      kind: 'upload' as const,
      id: attachment.id,
      attachment,
    }))
  }
  return getAvailableContentImages({
    media: value,
    contentType: contentContext.contentType,
    slug: contentContext.slug,
    contentSource: contentContext.contentSource,
    rulesetId: contentContext.rulesetId,
  })
}

function isMediaUploadScopeReady(scope: MediaManagerProps['scope']): boolean {
  if (scope.kind === 'user-pc') {
    return scope.userId.length > 0
  }
  return true
}

// fallow-ignore-next-line complexity
export function useMediaManager({
  onOpenChange,
  domain,
  value,
  scope,
  initialAssets = EMPTY_ASSETS,
  initialSelectedImageId,
  maxItems,
  contentContext,
  systemImageUrl: resolveSystemImageUrl = systemContentImageUrl,
  onSave,
}: MediaManagerProps) {
  const toast = useToastScope()
  const policy = getContentMediaPolicy(domain)
  const allowedRoles = policy.allowedRoles
  const deriveAvailableImages = useCallback<DeriveAvailableImages>(
    (media) => resolveAvailableImages(media, contentContext),
    [contentContext],
  )
  const initialAvailableImages = useMemo(
    () => resolveAvailableImages(value, contentContext),
    [contentContext, value],
  )
  const [state, dispatchReducer] = useReducer(
    (current: ReturnType<typeof createMediaSession>, action: MediaAction) =>
      mediaSessionReducer(current, action, deriveAvailableImages),
    undefined,
    () =>
      createMediaSession(
        value,
        initialSelectedImageId,
        allowedRoles,
        initialAvailableImages.length > 0
          ? initialAvailableImages
          : resolveAvailableImages(value, contentContext),
      ),
  )
  const sessionAvailableImages = useMemo(
    () => deriveAvailableImages(state.media),
    [deriveAvailableImages, state.media],
  )
  const [uploaded, setUploaded] = useState<Record<string, MediaAsset>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState<MediaManagerConfirm | null>(null)
  const removedSnapshots = useRef(new Map<string, RemovedImageSnapshot>())
  const stateRef = useRef(state)
  stateRef.current = state
  const mutationsLocked = saving
  const uploadScopeReady = isMediaUploadScopeReady(scope)
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

  const dispatch = useCallback(
    (action: MediaAction) => {
      if (mutationsLocked) return
      dispatchReducer(action)
    },
    [mutationsLocked],
  )

  const addAsset = useCallback(
    (asset: MediaAsset, id: string) => {
      if (mutationsLocked) return
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
    [mutationsLocked, state.media.images, toast, dispatch],
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
    uploadScopeReady && !mutationsLocked,
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
  const validation = validateContentMedia(state.media, {
    policy,
    assetDimensionsById: assets,
    maxItems,
  })
  const metadataReady = state.media.images.every((image) => Boolean(assets[image.assetId]))
  const label = domain === 'equipment' ? 'equipment item' : domain
  const selectedAvailable = state.selectedId
    ? sessionAvailableImages.find((image) => image.id === state.selectedId)
    : undefined
  const onAlt = useCallback(
    (alt: string) => {
      if (mutationsLocked) return
      if (state.selectedId && selectedAvailable?.kind === 'upload') {
        dispatch({ type: 'alt', id: state.selectedId, alt })
      }
    },
    [mutationsLocked, selectedAvailable?.kind, state.selectedId, dispatch],
  )
  const selectedUpload =
    selectedAvailable?.kind === 'upload'
      ? selectedAvailable.attachment
      : state.media.images.find((image) => image.id === state.selectedId)
  const selected = selectedUpload
  const asset = selected ? assets[selected.assetId] : undefined
  const selectedSourceDimensions =
    selectedAvailable?.kind === 'system'
      ? selectedAvailable.sourceDimensions
      : asset
        ? { width: asset.orientedWidth, height: asset.orientedHeight }
        : undefined

  function notifyRejectedDrop(message: string) {
    if (mutationsLocked) return
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
    if (mutationsLocked || !state.selectedId) return
    const apply = () =>
      dispatch({
        type: 'role',
        id: state.selectedId!,
        role,
        assigned,
        allowedRoles,
        source: selectedSourceDimensions,
      })
    const confirmation = shouldConfirmMediaRoleChange({
      role,
      assigned,
      selectedId: state.selectedId,
      media: state.media,
      assets,
      source: selectedSourceDimensions,
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

  function restoreRemovedImage(toastId: string) {
    if (mutationsLocked) return
    const snapshot = removedSnapshots.current.get(toastId)
    if (!snapshot) return
    dispatch({
      type: 'restoreRemoved',
      image: snapshot.image,
      index: snapshot.index,
      roles: snapshot.roles,
      restoreSelection: stateRef.current.selectedId === snapshot.fallbackSelectedId,
      allowedRoles,
    })
    removedSnapshots.current.delete(toastId)
    toast.dismiss(toastId)
  }

  function remove() {
    if (mutationsLocked || !selected || !asset) return
    const index = state.media.images.findIndex((image) => image.id === selected.id)
    const remainingImages = state.media.images.filter((image) => image.id !== selected.id)
    const fallbackSelectedId = resolvePostRemovalSelection(remainingImages, index)
    const roles = Object.fromEntries(
      allowedRoles
        .filter((role) => roleAssignmentMatchesImageId(state.media.roles[role], selected.id))
        .map((role) => [role, structuredClone(state.media.roles[role]!)]),
    ) as RemovedImageSnapshot['roles']
    const toastId = resolveMediaRemovedToastId()

    removedSnapshots.current.set(toastId, {
      toastId,
      image: structuredClone(selected),
      index,
      roles,
      fallbackSelectedId,
    })

    dispatch({ type: 'remove', id: selected.id, allowedRoles })

    toast.toast({
      id: toastId,
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
        onClick: () => restoreRemovedImage(toastId),
      },
      onDismiss: () => {
        removedSnapshots.current.delete(toastId)
      },
    })
  }

  const blocked = saving || !validation.ok || !metadataReady || uploads.entries.length > 0 || !dirty
  const canRemove = isRemovableMediaSelection(state.selectedId, sessionAvailableImages)
  const assignedRolesForSelection = state.selectedId
    ? resolveEffectiveImageRoles(
        state.media,
        state.selectedId,
        allowedRoles,
        sessionAvailableImages,
      ).roles
    : []

  async function save() {
    if (blocked) return
    setSaving(true)
    setError('')
    try {
      const normalizedMedia = contentContext
        ? normalizePersistedContentMedia({
            media: structuredClone(state.media),
            contentType: contentContext.contentType,
            slug: contentContext.slug,
            contentSource: contentContext.contentSource,
            rulesetId: contentContext.rulesetId,
            allowedRoles,
          })
        : structuredClone(state.media)

      await onSave({
        media: normalizedMedia,
        expectedMediaRevision: state.initial.revision,
        assets: Object.values(assets),
      })
      for (const toastId of removedSnapshots.current.keys()) {
        toast.dismiss(toastId)
      }
      removedSnapshots.current.clear()
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
    mutationsLocked,
    error,
    confirm,
    setConfirm,
    queries,
    uploads,
    selected,
    selectedAvailable,
    asset,
    selectedSourceDimensions,
    validation,
    label,
    onAlt,
    dismiss,
    changeRole,
    remove,
    save,
    blocked,
    canRemove,
    notifyRejectedDrop,
    resolveSystemImageUrl,
    sessionAvailableImages,
    assignedRolesForSelection,
  }
}

export type MediaManagerController = ReturnType<typeof useMediaManager>
