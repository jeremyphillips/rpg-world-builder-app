import { type CreateSpellInput, type Spell } from '@rpg/contracts'

import {
  contentFormFields,
  type ContentFormDef,
} from '../../lib/forms/registry/content-form-registry'
import { nameField } from '../../lib/forms/fields/content-identity-form-fields'
import { useSpells, useSpellsListResult, spellsQueryKey } from '../hooks/use-spells'
import {
  buildSpellTabs,
  spellDraftFormSchema,
  spellFormSchema,
  type SpellFormValues,
} from './spell-form-fields'
import { serializeContentFormInput } from '../../lib/forms/registry/content-form-serialize-input.lib'
import { buildIdentityPreparedWrite } from '../../lib/forms/submit/content-prepared-write.types'
import type { PrepareSerializedContentFormWriteInput } from '../../lib/forms/submit/prepare-serialized-content-form-write.lib'
import type { ContentFormInputCtx } from '../../lib/forms/registry/content-form-registry'
import {
  buildSpellCreateInput,
  buildSpellPreparedWrite,
  spellCreateDefaultValues,
  spellToFormValues,
} from './spell-form-values'
import { buildSpellPreviewIdentity, buildSpellPreviewSections } from './spell-preview-projection'
import { SpellPreviewPlayerHost } from './spell-preview-player-host'

const spellFormDef: ContentFormDef<Spell, SpellFormValues, CreateSpellInput> & {
  routeKey: 'spells'
} = {
  routeKey: 'spells',
  schema: spellFormSchema,
  draftSchema: spellDraftFormSchema,
  nameField,
  coverage: 'roundtrip-only',
  createDefaultValues: spellCreateDefaultValues,
  buildTabs: buildSpellTabs,
  buildFields: (ctx) => contentFormFields(spellFormDef, ctx),
  toFormValues: spellToFormValues,
  toInput: (values, ctx, validationIntent = 'publish') =>
    buildSpellCreateInput(values, ctx, validationIntent),
  serializePreparedWrite: (input: PrepareSerializedContentFormWriteInput<SpellFormValues>) => {
    const entity = input.inputCtx?.entity as { catalogLayer?: string } | undefined
    if (input.operation === 'update' && entity?.catalogLayer === 'system') {
      // Overlay intent envelope: field-level compaction provenance is not recorded here (see plan).
      return buildIdentityPreparedWrite(
        serializeContentFormInput(
          spellFormDef,
          input.values,
          input.inputCtx as ContentFormInputCtx<Spell> | undefined,
          input.validationIntent,
          {
            operation: input.operation,
            dirtyFields: input.form.formState.dirtyFields as Record<string, unknown> | undefined,
            rulesetId: input.rulesetId,
            ...input.serializeOptions,
          },
        ),
      )
    }
    return buildSpellPreparedWrite(
      input.values,
      input.inputCtx as ContentFormInputCtx<Spell> | undefined,
      input.validationIntent,
    )
  },
  overlayParticipantId: 'spells',
  normalizeOverlayBody: (values, ctx, validationIntent = 'publish') => {
    const { slug: _slug, ...body } = buildSpellCreateInput(values, ctx, validationIntent) as Record<
      string,
      unknown
    >
    return body
  },
  useListQuery: useSpells,
  useListQueryResult: useSpellsListResult,
  queryKey: spellsQueryKey,

  preview: {
    buildIdentity: buildSpellPreviewIdentity,
    buildSections: buildSpellPreviewSections,
    renderPlayerPreview: SpellPreviewPlayerHost,
  },
}

export { spellFormDef, spellFormSchema, spellDraftFormSchema }
export type { SpellFormValues }
