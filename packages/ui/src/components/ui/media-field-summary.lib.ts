export const MEDIA_FIELD_SUMMARY_MANAGE_IMAGES_LABEL = 'Manage images'

export type CompactSummaryCopy = {
  countLabel: string
  showManageGear: boolean
  previewAriaLabel: string
}

/** Visible image count for compact copy — derived previews count as one image. */
export function resolveCompactDisplayCount(attachmentCount: number, hasPreview: boolean): number {
  if (attachmentCount === 0 && hasPreview) return 1
  return attachmentCount
}

export function resolveCompactAttachmentCountLabel(
  displayCount: number,
  attachmentCount: number,
  maxItems: number,
): string {
  if (maxItems === 1) {
    if (displayCount === 0) return 'No image'
    const base = '1 image'
    return attachmentCount >= maxItems ? `${base} · Limit reached` : base
  }

  if (displayCount === 0) return 'No images'

  const noun = displayCount === 1 ? 'image' : 'images'
  const base = `${displayCount} ${noun}`
  if (attachmentCount >= maxItems) return `${base} · Limit reached`
  return base
}

export function resolveCompactSummaryCopy(
  attachmentCount: number,
  maxItems: number,
  hasPreview: boolean,
): CompactSummaryCopy {
  const displayCount = resolveCompactDisplayCount(attachmentCount, hasPreview)

  if (displayCount === 0 && !hasPreview) {
    const countLabel = resolveCompactAttachmentCountLabel(displayCount, attachmentCount, maxItems)
    return {
      countLabel,
      showManageGear: false,
      previewAriaLabel: `${countLabel}. Add`,
    }
  }

  const countLabel = resolveCompactAttachmentCountLabel(displayCount, attachmentCount, maxItems)
  return {
    countLabel,
    showManageGear: true,
    previewAriaLabel: countLabel,
  }
}
