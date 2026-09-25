'use client'

import * as React from 'react'
import { FileIcon, X } from 'lucide-react'

import { DropTargetPrompt } from './drop-target-prompt.client'
import {
  resolveFileDropzonePromptState,
  resolveFileDropzoneVisibility,
  resolveNextDropzoneFiles,
  validateDropzoneFiles,
} from './file-dropzone.lib'
import {
  fileNameVariants,
  fileMetaVariants,
  fileListVariants,
  fileItemVariants,
  fileThumbnailVariants,
  fileIconVariants,
  removeButtonVariants,
} from './file-dropzone.variants'
import { FilenamePreview } from './filename-preview.client'
import { Text } from './text'

/** Default accepted MIME types when `accept` is not specified. */
export const DEFAULT_ACCEPT = ['image/*']

export { matchesAccept } from './file-dropzone.lib'

export interface FileDropzoneProps {
  /** Current file list (controlled). */
  value?: File[]
  /** Called with the updated file list when files are added or removed. */
  onChange?: (files: File[]) => void
  /**
   * Accepted MIME types or file extensions (e.g. `['image/*']`, `['.pdf']`).
   * Defaults to `['image/*']`.
   */
  accept?: string[]
  /** Allow selecting multiple files. Defaults to `false`. */
  multiple?: boolean
  /** Maximum number of files when `multiple` is true. */
  maxFiles?: number
  /** Maximum size per file in bytes. */
  maxSize?: number
  /** Visual density — image drop targets default to `comfortable`. */
  density?: 'comfortable' | 'compact'
  /**
   * When false, the dashed region does not accept drops. Use when a parent owns
   * global file-drop handling (e.g. Manage images modal body overlay).
   */
  dropTarget?: boolean
  /**
   * URL for an already-uploaded image when `value` is empty (e.g. from a storage key).
   * Shown as a remote row in the file list until a new file is selected or cleared.
   */
  existingImageUrl?: string
  /** Label for the remote preview row. Defaults to "Current image". */
  existingImageLabel?: string
  /** Called when the user removes the stored image without selecting a replacement. */
  onClearExisting?: () => void
  disabled?: boolean
  className?: string
  /** Forwarded to the drop-zone div — allows `id` injection from `Field.Control`. */
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'true' | 'false'
}

interface UseFileDropzoneOptions {
  value: File[]
  onChange?: (files: File[]) => void
  accept: string[]
  multiple: boolean
  maxFiles?: number
  maxSize?: number
  disabled: boolean
  dropTarget: boolean
}

function useFileDropzone({
  value,
  onChange,
  accept,
  multiple,
  maxFiles,
  maxSize,
  disabled,
  dropTarget,
}: UseFileDropzoneOptions) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const previewUrlsRef = React.useRef(new Map<File, string>())
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    for (const [file, url] of [...previewUrlsRef.current]) {
      if (!value.includes(file)) {
        URL.revokeObjectURL(url)
        previewUrlsRef.current.delete(file)
      }
    }
  }, [value])

  React.useEffect(() => {
    const cache = previewUrlsRef.current
    return () => {
      for (const url of cache.values()) URL.revokeObjectURL(url)
      cache.clear()
    }
  }, [])

  function getPreviewUrl(file: File): string | null {
    if (!file.type.startsWith('image/')) return null
    const cache = previewUrlsRef.current
    if (!cache.has(file)) {
      cache.set(file, URL.createObjectURL(file))
    }
    return cache.get(file) ?? null
  }

  function addFiles(incoming: FileList | File[]) {
    const { accepted, error } = validateDropzoneFiles(Array.from(incoming), accept, maxSize)
    if (error) {
      setErrorMsg(error)
      return
    }
    setErrorMsg(null)
    onChange?.(resolveNextDropzoneFiles(value, accepted, multiple, maxFiles))
  }

  function removeFile(file: File) {
    onChange?.(value.filter((f) => f !== file))
    setErrorMsg(null)
  }

  function openPicker() {
    if (!disabled) inputRef.current?.click()
  }

  function handleDragOver(e: React.DragEvent) {
    if (!dropTarget) return
    e.preventDefault()
    if (!disabled) setIsDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!dropTarget) return
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false)
  }

  function handleDrop(e: React.DragEvent) {
    if (!dropTarget) return
    e.preventDefault()
    setIsDragOver(false)
    if (!disabled && e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files)
      e.target.value = ''
    }
  }

  return {
    inputRef,
    isDragOver,
    errorMsg,
    getPreviewUrl,
    openPicker,
    removeFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleInputChange,
  }
}

const DEFAULT_EXISTING_IMAGE_LABEL = 'Current image'

function ExistingImageRow({
  url,
  label,
  disabled,
  onRemove,
}: {
  url: string
  label: string
  disabled: boolean
  onRemove?: () => void
}) {
  return (
    <li className={fileItemVariants()}>
      <img src={url} alt={label} className={fileThumbnailVariants()} />
      <div className="min-w-0 flex-1">
        <FilenamePreview filename={label} density="compact" className={fileNameVariants()} />
        <p className={fileMetaVariants()}>Saved</p>
      </div>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className={removeButtonVariants()}
          disabled={disabled}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </li>
  )
}

function FileList({
  files,
  disabled,
  getPreviewUrl,
  onRemove,
}: {
  files: File[]
  disabled: boolean
  getPreviewUrl: (file: File) => string | null
  onRemove: (file: File) => void
}) {
  return (
    <>
      {files.map((file, index) => {
        const previewUrl = getPreviewUrl(file)
        return (
          <li key={`${file.name}-${index}`} className={fileItemVariants()}>
            {previewUrl ? (
              <img src={previewUrl} alt={file.name} className={fileThumbnailVariants()} />
            ) : (
              <span className={fileIconVariants()} aria-hidden="true">
                <FileIcon className="size-5" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <FilenamePreview
                filename={file.name}
                density="compact"
                className={fileNameVariants()}
              />
              <p className={fileMetaVariants()}>{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(file)}
              aria-label={`Remove ${file.name}`}
              className={removeButtonVariants()}
              disabled={disabled}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </li>
        )
      })}
    </>
  )
}

/**
 * Drag-and-drop file upload primitive. Controlled via `value` + `onChange`.
 * Supports MIME/size validation, per-file removal, and image thumbnail previews.
 * Browse files opens the picker; the dashed region is the drop target only.
 */
export function FileDropzone(props: FileDropzoneProps) {
  const {
    value = [],
    onChange,
    accept = DEFAULT_ACCEPT,
    multiple = false,
    maxFiles,
    maxSize,
    density = 'comfortable',
    dropTarget = true,
    existingImageUrl,
    existingImageLabel = DEFAULT_EXISTING_IMAGE_LABEL,
    onClearExisting,
    disabled = false,
    className,
    id,
    'aria-describedby': ariaDescribedby,
    'aria-invalid': ariaInvalid,
  } = props

  const dropzone = useFileDropzone({
    value,
    onChange,
    accept,
    multiple,
    maxFiles,
    maxSize,
    disabled,
    dropTarget,
  })

  const visibility = resolveFileDropzoneVisibility({
    value,
    multiple,
    maxFiles,
    existingImageUrl,
  })
  const promptState = resolveFileDropzonePromptState({
    disabled,
    isDragOver: dropzone.isDragOver,
    dropTarget,
  })

  return (
    <div className="w-full space-y-1">
      {visibility.showDropZone ? (
        <DropTargetPrompt
          id={id}
          accept={accept}
          multiple={multiple}
          maxSize={maxSize}
          density={density}
          state={promptState}
          showBrowse
          onBrowse={dropzone.openPicker}
          disabled={disabled}
          className={className}
          aria-describedby={ariaDescribedby}
          aria-invalid={ariaInvalid}
          onDragOver={dropzone.handleDragOver}
          onDragLeave={dropzone.handleDragLeave}
          onDrop={dropzone.handleDrop}
        />
      ) : null}

      <input
        ref={dropzone.inputRef}
        type="file"
        accept={accept.join(',')}
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={dropzone.handleInputChange}
      />

      {dropzone.errorMsg ? (
        <Text variant="destructive" role="alert">
          {dropzone.errorMsg}
        </Text>
      ) : null}

      {visibility.showFileList ? (
        <ul className={fileListVariants()} aria-label="Selected files">
          {visibility.showExistingImage ? (
            <ExistingImageRow
              url={existingImageUrl!}
              label={existingImageLabel}
              disabled={disabled}
              onRemove={onClearExisting}
            />
          ) : (
            <FileList
              files={value}
              disabled={disabled}
              getPreviewUrl={dropzone.getPreviewUrl}
              onRemove={dropzone.removeFile}
            />
          )}
        </ul>
      ) : null}
    </div>
  )
}
