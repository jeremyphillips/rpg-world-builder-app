export const MEDIA_FIELD_SUMMARY_MANAGE_IMAGES_LABEL = 'Manage images'

export type CompactSummaryCopy = {
  countLabel: string
  showManageGear: boolean
  previewAriaLabel: string
}

export type MediaFieldCountFigures = {
  galleryCount: number
  uploadCount: number
}

export function resolveMediaFieldCountFigures(
  uploadCount: number,
  galleryCount: number,
): MediaFieldCountFigures {
  return { uploadCount, galleryCount }
}

export function resolveExpandedCapacityHint(uploadCount: number, maxItems: number): string {
  return `${uploadCount} of ${maxItems} uploads`
}

export function resolveCompactAttachmentCountLabel(
  galleryCount: number,
  uploadCount: number,
  maxItems: number,
): string {
  if (maxItems === 1) {
    if (galleryCount === 0) return 'No image'
    const base = '1 image'
    return uploadCount >= maxItems ? `${base} · Limit reached` : base
  }

  if (galleryCount === 0) return 'No images'

  const noun = galleryCount === 1 ? 'image' : 'images'
  const base = `${galleryCount} ${noun}`
  if (uploadCount >= maxItems) return `${base} · Limit reached`
  return base
}

export function resolveCompactSummaryCopy(
  uploadCount: number,
  galleryCount: number,
  maxItems: number,
): CompactSummaryCopy {
  if (galleryCount === 0) {
    const countLabel = resolveCompactAttachmentCountLabel(galleryCount, uploadCount, maxItems)
    return {
      countLabel,
      showManageGear: false,
      previewAriaLabel: `${countLabel}. Add`,
    }
  }

  const countLabel = resolveCompactAttachmentCountLabel(galleryCount, uploadCount, maxItems)
  return {
    countLabel,
    showManageGear: true,
    previewAriaLabel: countLabel,
  }
}
