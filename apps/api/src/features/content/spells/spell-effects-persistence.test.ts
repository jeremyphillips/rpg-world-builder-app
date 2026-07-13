import { describe, it } from 'vitest'

/**
 * Stubs for `spell.effect.persistence` — effects authoring is enabled in the
 * dashboard but create/update input intentionally omits `effects` until this
 * capability lands. See spells README persistence checklist.
 */
describe('spell effects persistence (spell.effect.persistence)', () => {
  it.todo('persists effects on homebrew spell create')
  it.todo('persists effects on homebrew spell update')
  it.todo('round-trips effects through Mongo and API read model')
  it.todo('applies array replace semantics when patching effects[]')
})
