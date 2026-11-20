import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import type { MonsterFormValues } from '../../monster-form-values'
import { multiattackReplacementChoiceSelectOptions } from './monster-multiattack-form-options'

const ctx = {
  entityCatalogLayer: 'homebrew',
  spellCatalogStatus: 'ready',
  spellCatalogById: new Map(),
} as unknown as ContentFormCtx

const values = { actions: [] } as MonsterFormValues

describe('multiattackReplacementChoiceSelectOptions', () => {
  const rows = [
    { id: 'bite', kind: 'natural-weapon', name: 'Bite' },
    { id: 'fire-breath', kind: 'save', name: 'Fire Breath' },
  ] as MonsterFormValues['actions']

  it('omits attacks already in the primary sequence when unrestricted', () => {
    const options = multiattackReplacementChoiceSelectOptions({
      rows,
      multiattackId: 'multiattack',
      values,
      ctx,
      steps: [{ count: 2, actionIds: ['bite'] }],
      replacement: {},
      siblingChoices: [],
    })
    expect(options.map((option) => option.value)).toEqual(['fire-breath'])
  })

  it('keeps a stale stored choice visible for repair', () => {
    const options = multiattackReplacementChoiceSelectOptions({
      rows,
      multiattackId: 'multiattack',
      values,
      ctx,
      steps: [{ count: 2, actionIds: ['bite'] }],
      replacement: {},
      siblingChoices: [{ actionId: 'bite' }],
      storedChoice: { actionId: 'bite' },
    })
    expect(options.map((option) => option.value)).toContain('bite')
    expect(options.map((option) => option.value)).toContain('fire-breath')
  })
})
