import type { DefaultValues, FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'

import type { ContentStatus, ContentValidationIntent } from '@rpg/contracts'
import { contentStatusToValidationIntent } from '@rpg/contracts'

import { stripEditEnvelopeFromFormDefaults } from '../content-form-key-helpers'
import { mergeEditLayoutCtx } from './content-edit-form-ctx'
import type { AnyContentFormDef, ContentFormCtx } from '../content-form-registry'

export function resolveContentFormSchema(
  def: Pick<AnyContentFormDef, 'schema' | 'draftSchema' | 'resolveSchema'>,
  ctx: ContentFormCtx,
  validationIntent: ContentValidationIntent = 'publish',
) {
  if (def.resolveSchema) {
    return def.resolveSchema(ctx, validationIntent)
  }
  if (validationIntent === 'draft' && def.draftSchema) {
    return def.draftSchema
  }
  return def.schema
}

export function validationIntentForEditEntity(
  status: ContentStatus | undefined,
): ContentValidationIntent {
  return contentStatusToValidationIntent(status ?? 'published')
}

export function findContentEditEntity<T extends { id: string }>(
  entities: readonly T[] | undefined,
  entityId: string,
): T | undefined {
  return entities?.find((entity) => entity.id === entityId)
}

export type ContentEditFormLoadInput = {
  def: AnyContentFormDef
  entity: {
    id: string
    name: string
    source?: ContentFormCtx['entitySource']
    status?: ContentStatus
  }
  optionsCtx: ContentFormCtx
  formCtx?: Partial<ContentFormCtx>
  campaignId: string
  entityId: string
}

export type ContentEditFormLoadResult = {
  layoutCtx: ContentFormCtx
  schema: ZodType<FieldValues>
  validationIntent: ContentValidationIntent
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
  const layoutCtxWithSeeds: ContentFormCtx = def.enrichEditLayoutCtx
    ? def.enrichEditLayoutCtx(
        {
          ...layoutCtx,
          embeddedSeedRowIds: def.extractEmbeddedSeedRowIds?.(entity),
        },
        entity,
      )
    : {
        ...layoutCtx,
        embeddedSeedRowIds: def.extractEmbeddedSeedRowIds?.(entity),
      }

  const validationIntent = validationIntentForEditEntity(entity.status)

  return {
    layoutCtx: layoutCtxWithSeeds,
    schema: resolveContentFormSchema(def, layoutCtx, validationIntent),
    validationIntent,
    defaultValues: stripEditEnvelopeFromFormDefaults(def.toFormValues(entity), {
      stripKind: layoutCtx.equipmentKind != null,
    }),
  }
}
