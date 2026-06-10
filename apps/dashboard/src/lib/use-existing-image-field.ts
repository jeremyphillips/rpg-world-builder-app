import { useState } from 'react'
import { getAssetUrl } from '@rpg/contracts'
import type { FileFieldPropsMap } from '@rpg/ui/form'

import { uploadFile } from './api-client'

export interface UseExistingImageFieldOptions {
  /** Form field name holding the `File[]` value (e.g. `'avatar'`, `'banner'`). */
  fieldName: string
  /** Storage key currently persisted on the entity, if any. */
  currentKey: string | undefined
  /** Label shown beside the existing-image preview (e.g. "Current avatar"). */
  label: string
  /** Fallback error message for a failed upload. */
  uploadErrorMessage: string
}

export interface UseExistingImageFieldResult {
  /** Pass to the form's `fileFieldProps` so the stored image previews and can be cleared. */
  fileFieldProps: FileFieldPropsMap
  /**
   * Resolves the `imageKey` patch for a submit: uploads a newly selected file,
   * returns `''` when the user cleared the stored image, or `undefined` when
   * the image is unchanged (omit the key from the payload).
   */
  resolveImageKey: (files: File[] | undefined) => Promise<string | undefined>
}

/**
 * Wires a file field to an already-uploaded image: remote preview via
 * `fileFieldProps`, clear-without-reupload tracking, and upload-or-clear
 * resolution at submit time.
 */
export function useExistingImageField({
  fieldName,
  currentKey,
  label,
  uploadErrorMessage,
}: UseExistingImageFieldOptions): UseExistingImageFieldResult {
  const [clearedKey, setClearedKey] = useState<string | null>(null)

  const fileFieldProps: FileFieldPropsMap = {
    [fieldName]: {
      existingImageUrl:
        currentKey && currentKey !== clearedKey ? getAssetUrl(currentKey) : undefined,
      existingImageLabel: label,
      onClearExisting: () => setClearedKey(currentKey ?? null),
    },
  }

  async function resolveImageKey(files: File[] | undefined): Promise<string | undefined> {
    if (files?.[0]) return uploadFile(files[0], uploadErrorMessage)
    if (clearedKey !== null) return ''
    return undefined
  }

  return { fileFieldProps, resolveImageKey }
}
