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
import {
  buildSpellCreateInput,
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
