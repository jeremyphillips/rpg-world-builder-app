import type { FieldValues } from 'react-hook-form'
import type { PreviewRailFact } from '@rpg/ui'

import type { ContentFormCtx } from '../registry/content-form-registry'

/** Derived section kind — dashboard maps this to rail markers without Class vocabulary in @rpg/ui. */
export type ContentPreviewDerivedKind =
  | 'ready'
  | 'off'
  | 'none'
  | 'notConfigured'
  | 'count'
  | 'prepared'
  | 'known'
  | 'fullList'

export type ContentPreviewIdentity = {
  name: string
  imageSrc?: string
  facts: PreviewRailFact[]
}

export type ContentPreviewSection = {
  derivedKind: ContentPreviewDerivedKind
  status?: string
  description?: string
  facts?: PreviewRailFact[]
}

export type ContentPreviewDetail = {
  name: string
  imageSrc?: string
  descriptionHtml?: string
  viewModel: unknown
}

export type ContentPreviewResources = {
  subclasses?: readonly { id: string; name: string }[]
}

export type ContentFormPreviewConfig<TFormValues extends FieldValues = FieldValues> = {
  buildIdentity: (values: TFormValues, ctx: ContentFormCtx) => ContentPreviewIdentity
  /** Keyed by tab id. Every tab id MUST be present; `null` = explicit opt-out from the rail. */
  buildSections: (
    values: TFormValues,
    ctx: ContentFormCtx,
    resources?: ContentPreviewResources,
  ) => Record<string, ContentPreviewSection | null>
  buildPreviewDetail: (values: TFormValues, ctx: ContentFormCtx) => ContentPreviewDetail
}

export function hasContentFormPreview(def: {
  preview?: ContentFormPreviewConfig<FieldValues> | undefined
}): boolean {
  return (
    def.preview?.buildIdentity != null &&
    def.preview.buildSections != null &&
    def.preview.buildPreviewDetail != null
  )
}
