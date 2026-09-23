export const MEDIA_IMAGE_ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const

function matchesAccept(file: File, accept: readonly string[]): boolean {
  return accept.some((pattern) => {
    if (pattern.endsWith('/*')) return file.type.startsWith(pattern.slice(0, -1))
    return file.type === pattern || file.name.endsWith(pattern)
  })
}

export function isMediaImageFile(file: File): boolean {
  return matchesAccept(file, MEDIA_IMAGE_ACCEPT)
}

export function areMediaImageTypesValid(files: File[]): boolean {
  if (files.length === 0) return false
  return files.every((file) => isMediaImageFile(file))
}

export function areMediaImageFilesValid(files: File[], maxUploadBytes?: number): boolean {
  if (!areMediaImageTypesValid(files)) return false
  return files.every((file) => maxUploadBytes === undefined || file.size <= maxUploadBytes)
}

export function readDraggedMediaFiles(dataTransfer: DataTransfer): File[] {
  return Array.from(dataTransfer.files ?? [])
}

export function readDraggedMediaFileSizes(dataTransfer: DataTransfer): number[] {
  const files = readDraggedMediaFiles(dataTransfer)
  if (files.length > 0) return files.map((file) => file.size)
  return Array.from(dataTransfer.items ?? [])
    .filter((item) => item.kind === 'file')
    .map((item) => item.getAsFile()?.size ?? 0)
    .filter((size) => size > 0)
}

export function canAcceptDraggedMediaFiles(
  dataTransfer: DataTransfer,
  maxUploadBytes?: number,
): boolean | undefined {
  const items = Array.from(dataTransfer.items ?? [])
  if (items.length === 0) return undefined
  const types = items.map((item) => item.type).filter(Boolean)
  if (types.length !== items.length) return undefined
  const sizes = readDraggedMediaFileSizes(dataTransfer)
  const withinSizeLimit =
    maxUploadBytes === undefined ||
    sizes.length === 0 ||
    sizes.every((size) => size <= maxUploadBytes)
  return (
    types.every((type) =>
      MEDIA_IMAGE_ACCEPT.includes(type as (typeof MEDIA_IMAGE_ACCEPT)[number]),
    ) && withinSizeLimit
  )
}

export function isExternalFileDrag(dataTransfer: DataTransfer | null | undefined): boolean {
  return Boolean(dataTransfer?.types.includes('Files'))
}
