import type { DefaultValues, FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'

import { stripEditEnvelopeFromFormDefaults } from './content-form-key-helpers'
import { mergeEditLayoutCtx } from './content-edit-form-ctx'
import type { AnyContentFormDef, ContentFormCtx } from './content-form-registry'

export function resolveContentFormSchema(
  def: Pick<AnyContentFormDef, 'schema' | 'resolveSchema'>,
  ctx: ContentFormCtx,
) {
  return def.resolveSchema?.(ctx) ?? def.schema
}

export function findContentEditEntity<T extends { id: string }>(
  entities: readonly T[] | undefined,
  entityId: string,
): T | undefined {
  return entities?.find((entity) => entity.id === entityId)
}

export type ContentEditFormLoadInput = {
  def: AnyContentFormDef
  entity: { id: string; name: string; source?: ContentFormCtx['entitySource'] }
  optionsCtx: ContentFormCtx
  formCtx?: Partial<ContentFormCtx>
  campaignId: string
  entityId: string
}

export type ContentEditFormLoadResult = {
  layoutCtx: ContentFormCtx
  schema: ZodType<FieldValues>
  defaultValues: DefaultValues<FieldValues>
}

/** Resolves edit layout context, schema, and stripped form defaults for a cached entity. */
export function loadContentEditFormState({
  def,
  entity,
  optionsCtx,
  formCtx,
  campaignId,
  entityId,
}: ContentEditFormLoadInput): ContentEditFormLoadResult {
  const layoutCtx = mergeEditLayoutCtx(optionsCtx, formCtx, campaignId, entityId, entity)
  const layoutCtxWithSeeds: ContentFormCtx = {
    ...layoutCtx,
    embeddedSeedRowIds: def.extractEmbeddedSeedRowIds?.(entity),
  }

  return {
    layoutCtx: layoutCtxWithSeeds,
    schema: resolveContentFormSchema(def, layoutCtx),
    defaultValues: stripEditEnvelopeFromFormDefaults(def.toFormValues(entity), {
      stripKind: layoutCtx.equipmentKind != null,
    }),
  }
}
