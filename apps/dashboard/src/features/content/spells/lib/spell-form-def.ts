import { type CreateSpellInput, type Spell } from '@rpg/contracts'

import {
  contentFormRegistry,
  contentFormFields,
  type ContentFormDef,
} from '../../lib/forms/registry/content-form-registry'
import { nameField } from '../../lib/forms/fields/content-identity-form-fields'
import { useSpells, spellsQueryKey } from '../hooks/use-spells'
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

const spellFormDef: ContentFormDef<Spell, SpellFormValues, CreateSpellInput> = {
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
  useListQuery: useSpells,
  queryKey: spellsQueryKey,
}

contentFormRegistry['spells'] = spellFormDef

export { spellFormDef, spellFormSchema, spellDraftFormSchema }
export type { SpellFormValues }
