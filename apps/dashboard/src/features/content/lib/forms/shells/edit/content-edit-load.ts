import type { DefaultValues, FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'

import type { ContentStatus, ContentValidationIntent } from '@rpg/contracts'
import { contentStatusToValidationIntent } from '@rpg/contracts'

import { stripEditEnvelopeFromFormDefaults } from '../../registry/content-form-key-helpers'
import { mergeEditLayoutCtx } from './content-edit-form-ctx'
import type { AnyContentFormDef, ContentFormCtx } from '../../registry/content-form-registry'
import { persistedIdentityRowIdsByPathForParticipant } from '../../registry/persisted-identity-row-ids.lib'

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

/** Publish schema used by both the Publish action and the preview-rail readiness parse. */
export function resolveContentPublishSchema(
  def: Pick<AnyContentFormDef, 'schema' | 'draftSchema' | 'resolveSchema'>,
  ctx: ContentFormCtx,
) {
  return resolveContentFormSchema(def, ctx, 'publish')
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

/** Replaces one list-cache entity so the edit shell reloads saved row ids immediately. */
export function replaceCachedContentEntity<T extends { id: string }>(
  current: readonly T[] | undefined,
  saved: T,
): readonly T[] | undefined {
  if (!current) return current
  const index = current.findIndex((entity) => entity.id === saved.id)
  if (index < 0) return [...current, saved]
  const next = current.slice()
  next[index] = saved
  return next
}

/** Replaces an entity in either the legacy array cache or the canonical list-result cache. */
export function replaceCachedContentListEntity<T extends { id: string }>(
  current: unknown,
  saved: T,
): unknown {
  if (Array.isArray(current)) return replaceCachedContentEntity(current as readonly T[], saved)
  if (
    typeof current !== 'object' ||
    current === null ||
    !('items' in current) ||
    !Array.isArray(current.items)
  ) {
    return current
  }
  return {
    ...current,
    items: replaceCachedContentEntity(current.items as readonly T[], saved),
  }
}

function persistedIdentityForEntity(
  def: Pick<AnyContentFormDef, 'overlayParticipantId'>,
  entity: unknown,
): Readonly<Record<string, readonly string[]>> | undefined {
  if (!def.overlayParticipantId) return undefined
  return persistedIdentityRowIdsByPathForParticipant(
    entity as Record<string, unknown>,
    def.overlayParticipantId,
  )
}

export type ContentEditFormLoadInput = {
  def: AnyContentFormDef
  entity: {
    id: string
    name: string
    catalogLayer?: ContentFormCtx['entityCatalogLayer']
    status?: ContentStatus
  }
  optionsCtx: ContentFormCtx
  formCtx?: Partial<ContentFormCtx>
  campaignId: string
  entityId: string
  armorClassRules?: ContentFormCtx['armorClassRules']
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
  armorClassRules,
}: ContentEditFormLoadInput): ContentEditFormLoadResult {
  const persistedIdentityRowIdsByPath = persistedIdentityForEntity(def, entity)
  const layoutCtx = {
    ...mergeEditLayoutCtx(optionsCtx, formCtx, campaignId, entityId, entity),
    ...(armorClassRules ? { armorClassRules } : {}),
  }
  const layoutCtxWithPersisted: ContentFormCtx = def.enrichEditLayoutCtx
    ? def.enrichEditLayoutCtx(
        {
          ...layoutCtx,
          ...(persistedIdentityRowIdsByPath ? { persistedIdentityRowIdsByPath } : {}),
        },
        entity,
      )
    : {
        ...layoutCtx,
        ...(persistedIdentityRowIdsByPath ? { persistedIdentityRowIdsByPath } : {}),
      }

  const validationIntent = validationIntentForEditEntity(entity.status)

  return {
    layoutCtx: { ...layoutCtxWithPersisted, validationIntent },
    schema: resolveContentFormSchema(def, layoutCtx, validationIntent),
    validationIntent,
    defaultValues: stripEditEnvelopeFromFormDefaults(
      def.toFormValues(entity, { armorClassRules: layoutCtx.armorClassRules }),
      {
        stripKind: layoutCtx.equipmentKind != null,
      },
    ),
  }
}
