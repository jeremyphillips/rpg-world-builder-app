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

export function areMediaImageFilesValid(files: File[], maxUploadBytes?: number): boolean {
  if (files.length === 0) return false
  return files.every(
    (file) =>
      isMediaImageFile(file) && (maxUploadBytes === undefined || file.size <= maxUploadBytes),
  )
}

export function readDraggedMediaFiles(dataTransfer: DataTransfer): File[] {
  return Array.from(dataTransfer.files ?? [])
}

export function canAcceptDraggedMediaFiles(
  dataTransfer: DataTransfer,
  maxUploadBytes?: number,
): boolean | undefined {
  const items = Array.from(dataTransfer.items ?? [])
  if (items.length === 0) return undefined
  const types = items.map((item) => item.type).filter(Boolean)
  if (types.length !== items.length) return undefined
  return types.every(
    (type) =>
      MEDIA_IMAGE_ACCEPT.includes(type as (typeof MEDIA_IMAGE_ACCEPT)[number]) &&
      (maxUploadBytes === undefined ||
        readDraggedMediaFiles(dataTransfer).every((file) => file.size <= maxUploadBytes)),
  )
}

export function isExternalFileDrag(dataTransfer: DataTransfer | null | undefined): boolean {
  return Boolean(dataTransfer?.types.includes('Files'))
}
