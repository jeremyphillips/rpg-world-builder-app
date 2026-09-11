import type { ReactNode } from 'react'
import type { FieldValues } from 'react-hook-form'
import type { PreviewRailFact } from '@rpg/ui'

import type { ContentFormCtx } from '../registry/content-form-registry'

/** Derived section kind — dashboard maps this to rail markers without domain vocabulary in @rpg/ui. */
export type ContentPreviewDerivedKind = 'ready' | 'off' | 'none' | 'notConfigured' | 'count'

export type ContentPreviewIdentity = {
  name: string
  imageSrc?: string
  /** Optional header metadata — omit when facts belong in a scroll section instead. */
  facts?: PreviewRailFact[]
}

export type ContentPreviewSection = {
  derivedKind: ContentPreviewDerivedKind
  status?: string
  description?: string
  facts?: PreviewRailFact[]
}

/** Props for {@link PreviewRail.SectionBody} derived from a preview section projection. */
export type ContentPreviewSectionBodyProps = {
  description?: string
  facts?: PreviewRailFact[]
}

export type ContentPreviewResourcesProps<TResources> = {
  ctx: ContentFormCtx
  children: (resources: TResources) => ReactNode
}

export type ContentPreviewPlayerPreviewProps<TFormValues extends FieldValues> = {
  values: TFormValues
  ctx: ContentFormCtx
  open: boolean
  onOpenChange: (open: boolean) => void
}

export type ContentFormPreviewConfig<
  TFormValues extends FieldValues = FieldValues,
  TResources = unknown,
> = {
  buildIdentity: (values: TFormValues, ctx: ContentFormCtx) => ContentPreviewIdentity
  /** Keyed by tab id. Every tab id MUST be present; `null` = explicit opt-out from the rail. */
  buildSections: (
    values: TFormValues,
    ctx: ContentFormCtx,
    resources?: TResources,
  ) => Record<string, ContentPreviewSection | null>
  /** Optional provider that resolves async/domain resources for {@link buildSections}. */
  PreviewResources?: (props: ContentPreviewResourcesProps<TResources>) => ReactNode
  /** Optional player-facing preview modal — omit when the type has no player surface yet. */
  renderPlayerPreview?: (props: ContentPreviewPlayerPreviewProps<TFormValues>) => ReactNode
}

export function hasContentFormPreview(def: {
  preview?: ContentFormPreviewConfig<FieldValues> | undefined
}): boolean {
  return def.preview?.buildIdentity != null && def.preview.buildSections != null
}
