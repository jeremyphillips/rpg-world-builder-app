import { describe, expect, it } from 'vitest'
import { createSpellDraftInputSchema } from '@rpg/contracts'

import { spellFormDef } from './spell-form-def'
import type { SpellFormValues } from './spell-form-fields'
import { spellDraftFormSchema } from './spell-form-fields'

describe('spell create defaults draft persist path', () => {
  const createDefaults = {
    ...spellFormDef.createDefaultValues,
    name: '',
  } as SpellFormValues

  it('draft resolver accepts create defaults without school', () => {
    expect(spellDraftFormSchema.safeParse(createDefaults).success).toBe(true)
  })

  it('toInput(draft) accepts create defaults and omits school', () => {
    const input = spellFormDef.toInput(createDefaults, undefined, 'draft')
    expect(createSpellDraftInputSchema.safeParse(input).success).toBe(true)
    expect(input).not.toHaveProperty('school')
  })
})
