'use client'

import * as React from 'react'
import { FileIcon, ImageIcon, UploadCloudIcon, X } from 'lucide-react'

import { cn } from '../../lib/utils'
import {
  dropzoneVariants,
  dropzoneIconVariants,
  fileListVariants,
  fileItemVariants,
  fileThumbnailVariants,
  fileIconVariants,
  removeButtonVariants,
} from './file-dropzone.variants'

/** Default accepted MIME types when `accept` is not specified. */
export const DEFAULT_ACCEPT = ['image/*']

/** Returns true if a given File matches any entry in the accept list. */
function matchesAccept(file: File, accept: string[]): boolean {
  return accept.some((pattern) => {
    if (pattern.endsWith('/*')) return file.type.startsWith(pattern.slice(0, -1))
    return file.type === pattern || file.name.endsWith(pattern)
  })
}

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

// ---------------------------------------------------------------------------
// Hook — all state and event logic lives here
// ---------------------------------------------------------------------------

interface UseFileDropzoneOptions {
  value: File[]
  onChange?: (files: File[]) => void
  accept: string[]
  multiple: boolean
  maxFiles?: number
  maxSize?: number
  disabled: boolean
}

function useFileDropzone({
  value,
  onChange,
  accept,
  multiple,
  maxFiles,
  maxSize,
  disabled,
}: UseFileDropzoneOptions) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [previewUrls, setPreviewUrls] = React.useState<Map<File, string>>(() => new Map())
  const previewUrlsRef = React.useRef(previewUrls)
  previewUrlsRef.current = previewUrls

  React.useEffect(() => {
    setPreviewUrls((prev) => {
      const next = new Map(prev)
      let changed = false

      for (const [file, url] of prev) {
        if (!value.includes(file)) {
          URL.revokeObjectURL(url)
          next.delete(file)
          changed = true
        }
      }

      for (const file of value) {
        if (file.type.startsWith('image/') && !next.has(file)) {
          next.set(file, URL.createObjectURL(file))
          changed = true
        }
      }

      return changed ? next : prev
    })
  }, [value])

  React.useEffect(() => {
    return () => {
      for (const url of previewUrlsRef.current.values()) URL.revokeObjectURL(url)
    }
  }, [])

  function getPreviewUrl(file: File): string | null {
    if (!file.type.startsWith('image/')) return null
    return previewUrls.get(file) ?? null
  }

  function validateAndFilter(files: File[]): { accepted: File[]; error: string | null } {
    const errors: string[] = []
    const accepted = files.filter((file) => {
      if (!matchesAccept(file, accept)) {
        errors.push(`"${file.name}" is not an accepted file type.`)
        return false
      }
      if (maxSize !== undefined && file.size > maxSize) {
        errors.push(`"${file.name}" exceeds the ${(maxSize / 1024 / 1024).toFixed(1)} MB limit.`)
        return false
      }
      return true
    })
    return { accepted, error: errors.length > 0 ? errors.join(' ') : null }
  }

  function addFiles(incoming: FileList | File[]) {
    const { accepted, error } = validateAndFilter(Array.from(incoming))
    if (error) {
      setErrorMsg(error)
      return
    }
    setErrorMsg(null)
    const next = multiple ? [...value, ...accepted].slice(0, maxFiles) : accepted.slice(0, 1)
    onChange?.(next)
  }

  function removeFile(file: File) {
    const next = value.filter((f) => f !== file)
    onChange?.(next)
    setErrorMsg(null)
  }

  function openPicker() {
    if (!disabled) inputRef.current?.click()
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    if (!disabled) setIsDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    if (!disabled && e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openPicker()
    }
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
    handleKeyDown,
    handleInputChange,
  }
}

// ---------------------------------------------------------------------------
// DropZoneArea — the interactive drop target
// ---------------------------------------------------------------------------

type DropZoneState = 'idle' | 'dragover' | 'disabled'

function getDropZoneAriaLabel(disabled: boolean, multiple: boolean): string {
  if (disabled) return 'File upload disabled'
  return `Upload file${multiple ? 's' : ''}. Press Enter or Space to browse.`
}

function DropZoneContent({ isDragOver, state }: { isDragOver: boolean; state: DropZoneState }) {
  const Icon = isDragOver ? UploadCloudIcon : ImageIcon
  return (
    <>
      <Icon className={cn('size-8', dropzoneIconVariants({ state }))} aria-hidden="true" />
      <p className="text-sm font-medium">
        {isDragOver ? 'Drop to upload' : 'Drag & drop or click to browse'}
      </p>
    </>
  )
}

function DropZoneHints({ accept, maxSize }: { accept: string[]; maxSize?: number }) {
  return (
    <>
      {accept !== DEFAULT_ACCEPT && (
        <p className="text-xs text-muted-foreground">{accept.join(', ')}</p>
      )}
      {maxSize !== undefined && (
        <p className="text-xs text-muted-foreground">
          Max {(maxSize / 1024 / 1024).toFixed(0)} MB per file
        </p>
      )}
    </>
  )
}

interface DropZoneAreaProps {
  id?: string
  isDragOver: boolean
  disabled: boolean
  multiple: boolean
  accept: string[]
  maxSize?: number
  className?: string
  ariaDescribedby?: string
  ariaInvalid?: boolean | 'true' | 'false'
  onDragOver: React.DragEventHandler
  onDragLeave: React.DragEventHandler
  onDrop: React.DragEventHandler
  onClick: () => void
  onKeyDown: React.KeyboardEventHandler
}

function DropZoneArea({
  id,
  isDragOver,
  disabled,
  multiple,
  accept,
  maxSize,
  className,
  ariaDescribedby,
  ariaInvalid,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  onKeyDown,
}: DropZoneAreaProps) {
  const state: DropZoneState = disabled ? 'disabled' : isDragOver ? 'dragover' : 'idle'
  return (
    <div
      id={id}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={getDropZoneAriaLabel(disabled, multiple)}
      aria-describedby={ariaDescribedby}
      aria-invalid={ariaInvalid}
      aria-disabled={disabled}
      className={cn(dropzoneVariants({ state }), className)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <DropZoneContent isDragOver={isDragOver} state={state} />
      <DropZoneHints accept={accept} maxSize={maxSize} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// FileList — selected files with preview thumbnails and remove buttons
// ---------------------------------------------------------------------------

interface FileListProps {
  files: File[]
  disabled: boolean
  getPreviewUrl: (file: File) => string | null
  onRemove: (file: File) => void
}

const DEFAULT_EXISTING_IMAGE_LABEL = 'Current image'

interface ExistingImageRowProps {
  url: string
  label: string
  disabled: boolean
  onRemove?: () => void
}

function ExistingImageRow({ url, label, disabled, onRemove }: ExistingImageRowProps) {
  return (
    <li className={fileItemVariants()}>
      <img src={url} alt={label} className={fileThumbnailVariants()} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">Saved</p>
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

function FileList({ files, disabled, getPreviewUrl, onRemove }: FileListProps) {
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
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
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

// ---------------------------------------------------------------------------
// FileDropzone — public component
// ---------------------------------------------------------------------------

/**
 * Drag-and-drop file upload primitive. Controlled via `value` + `onChange`.
 * Supports click-to-browse, keyboard activation (Enter/Space), MIME/size
 * validation, per-file removal, and image thumbnail previews.
 *
 * Compose inside `FileField` for full label/hint/error wiring, or use directly
 * with your own `useForm` + `Controller`.
 */
export function FileDropzone({
  value = [],
  onChange,
  accept = DEFAULT_ACCEPT,
  multiple = false,
  maxFiles,
  maxSize,
  existingImageUrl,
  existingImageLabel = DEFAULT_EXISTING_IMAGE_LABEL,
  onClearExisting,
  disabled = false,
  className,
  id,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
}: FileDropzoneProps) {
  const {
    inputRef,
    isDragOver,
    errorMsg,
    getPreviewUrl,
    openPicker,
    removeFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleKeyDown,
    handleInputChange,
  } = useFileDropzone({ value, onChange, accept, multiple, maxFiles, maxSize, disabled })

  const atLimit = !multiple || (maxFiles !== undefined && value.length >= maxFiles)
  const showDropZone = !atLimit || value.length === 0
  const showExistingImage = value.length === 0 && Boolean(existingImageUrl)
  const showFileList = value.length > 0 || showExistingImage

  return (
    <div className="w-full space-y-1">
      {showDropZone ? (
        <DropZoneArea
          id={id}
          isDragOver={isDragOver}
          disabled={disabled}
          multiple={multiple}
          accept={accept}
          maxSize={maxSize}
          className={className}
          ariaDescribedby={ariaDescribedby}
          ariaInvalid={ariaInvalid}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openPicker}
          onKeyDown={handleKeyDown}
        />
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept.join(',')}
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={handleInputChange}
      />

      {errorMsg ? (
        <p role="alert" className="text-sm text-destructive">
          {errorMsg}
        </p>
      ) : null}

      {showFileList ? (
        <ul className={fileListVariants()} aria-label="Selected files">
          {showExistingImage ? (
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
              getPreviewUrl={getPreviewUrl}
              onRemove={removeFile}
            />
          )}
        </ul>
      ) : null}
    </div>
  )
}
