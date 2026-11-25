import type { ContentMedia, ContentValidationIntent } from '@rpg/contracts'
import { emptyContentMediaSchema } from '@rpg/contracts'
import type { QueryClient } from '@tanstack/react-query'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

import { stripEditEnvelopeFromFormDefaults } from '../../registry/content-form-key-helpers'
import type { AnyContentFormDef, ContentFormCtx } from '../../registry/content-form-registry'
import {
  CONTENT_MEDIA_STALE_FORM_MESSAGE,
  extractStaleMediaFromError,
} from './content-edit-stale-media.lib'
import { replaceCachedContentListEntity } from './content-edit-load'

export type ContentEditPersistInput<TEntity extends { id: string; catalogLayer: string }> = {
  def: AnyContentFormDef
  entity: TEntity
  campaignId: string
  layoutCtx: ContentFormCtx
  wireInput: Record<string, unknown>
  form: UseFormReturn<FieldValues>
  mutation: { mutateAsync: (input: unknown) => Promise<unknown> }
  queryClient: QueryClient
  setOverlayBaseline: (baseline: Record<string, unknown> | null) => void
  validationIntent: ContentValidationIntent
}

export async function persistContentEditUpdate<
  TEntity extends {
    id: string
    catalogLayer: string
    media?: ContentMedia
  },
>(input: ContentEditPersistInput<TEntity>): Promise<FieldValues> {
  const { def, entity, campaignId, layoutCtx, wireInput, form, mutation, queryClient } = input

  let saved: unknown
  try {
    saved = await mutation.mutateAsync(wireInput)
  } catch (error) {
    const serverMedia = extractStaleMediaFromError(error)
    if (serverMedia === undefined) throw error

    form.resetField('media', { defaultValue: serverMedia })
    throw new Error(CONTENT_MEDIA_STALE_FORM_MESSAGE, { cause: error })
  }

  const savedRecord = saved as typeof entity & { media?: ContentMedia }
  queryClient.setQueryData(def.queryKey(campaignId), (current: unknown) =>
    replaceCachedContentListEntity(current, savedRecord),
  )

  const baseline = stripEditEnvelopeFromFormDefaults(
    {
      ...def.toFormValues(saved, { armorClassRules: layoutCtx.armorClassRules }),
      media: savedRecord.media ?? emptyContentMediaSchema,
    },
    {
      stripKind: layoutCtx.equipmentKind != null,
    },
  ) as FieldValues

  form.reset(baseline)

  if (entity.catalogLayer === 'system' && def.normalizeOverlayBody) {
    input.setOverlayBaseline(
      def.normalizeOverlayBody(
        baseline as never,
        { entity: savedRecord, armorClassRules: layoutCtx.armorClassRules },
        input.validationIntent,
      ),
    )
  }

  return baseline
}
