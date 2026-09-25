import type { DropTargetPromptState } from './drop-target-prompt.lib'

export function matchesAccept(file: File, accept: string[]): boolean {
  return accept.some((pattern) => {
    if (pattern.endsWith('/*')) return file.type.startsWith(pattern.slice(0, -1))
    return file.type === pattern || file.name.endsWith(pattern)
  })
}

export function validateDropzoneFiles(
  files: File[],
  accept: string[],
  maxSize?: number,
): { accepted: File[]; error: string | null } {
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

export function resolveNextDropzoneFiles(
  value: File[],
  accepted: File[],
  multiple: boolean,
  maxFiles?: number,
): File[] {
  return multiple ? [...value, ...accepted].slice(0, maxFiles) : accepted.slice(0, 1)
}

export function resolveFileDropzoneVisibility(options: {
  value: File[]
  multiple: boolean
  maxFiles?: number
  existingImageUrl?: string
}): {
  showDropZone: boolean
  showExistingImage: boolean
  showFileList: boolean
} {
  const atLimit =
    !options.multiple ||
    (options.maxFiles !== undefined && options.value.length >= options.maxFiles)
  const showExistingImage = options.value.length === 0 && Boolean(options.existingImageUrl)
  return {
    showDropZone: !atLimit || options.value.length === 0,
    showExistingImage,
    showFileList: options.value.length > 0 || showExistingImage,
  }
}

export function resolveFileDropzonePromptState(options: {
  disabled: boolean
  isDragOver: boolean
  dropTarget: boolean
}): DropTargetPromptState {
  if (options.disabled) return 'disabled'
  return options.isDragOver && options.dropTarget ? 'active' : 'idle'
}
