import { type CreateSpellInput, type Spell } from '@rpg/contracts'

import {
  contentFormRegistry,
  contentFormFields,
  type ContentFormDef,
} from '../../lib/forms/content-form-registry'
import { useSpells, spellsQueryKey } from '../hooks/use-spells'
import { buildSpellTabs, spellFormSchema, type SpellFormValues } from './spell-form-fields'
import {
  buildSpellCreateInput,
  spellCreateDefaultValues,
  spellToFormValues,
} from './spell-form-values'

const spellFormDef: ContentFormDef<Spell, SpellFormValues, CreateSpellInput> = {
  routeKey: 'spells',
  schema: spellFormSchema,
  coverage: 'roundtrip-only',
  createDefaultValues: spellCreateDefaultValues,
  buildTabs: buildSpellTabs,
  buildFields: (ctx) => contentFormFields(spellFormDef, ctx),
  toFormValues: spellToFormValues,
  toInput: buildSpellCreateInput,
  useListQuery: useSpells,
  queryKey: spellsQueryKey,
}

contentFormRegistry['spells'] = spellFormDef

export { spellFormDef, spellFormSchema }
export type { SpellFormValues }
