import { hasContentFormPreview } from '../../preview/content-form-preview.types'

export type ContentFormScrollMode = 'document' | 'viewport'
export type ContentFormPageWidth = 'narrow' | 'wide'

export type ContentFormLayout = {
  /** Preview rail + publish validation chrome are active. */
  previewEnabled: boolean
  pageWidth: ContentFormPageWidth
  scrollMode: ContentFormScrollMode
}

type ContentFormLayoutInput = {
  preview?: unknown
  buildTabs?: unknown
}

/**
 * Resolves page width and scroll ownership for catalog create/edit routes.
 * Policy: preview-enabled forms use viewport scroll for PreviewRail fill layout.
 */
export function resolveContentFormLayout(def: ContentFormLayoutInput): ContentFormLayout {
  const previewCapable = hasContentFormPreview(def as Parameters<typeof hasContentFormPreview>[0])
  const hasTabs = def.buildTabs != null
  const previewEnabled = previewCapable && hasTabs

  if (previewCapable && !hasTabs) {
    return {
      previewEnabled: false,
      pageWidth: 'wide',
      scrollMode: 'document',
    }
  }

  return {
    previewEnabled,
    pageWidth: previewCapable ? 'wide' : 'narrow',
    scrollMode: previewEnabled ? 'viewport' : 'document',
  }
}
