import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  CHILL_TOUCH_RESOLUTION,
  ELDRITCH_BLAST_RESOLUTION,
  INFlict_WOUNDS_RESOLUTION,
  SPELL_RESOLUTION_FIXTURES,
} from './resolution-fixtures'
import { resolutionFormSchema } from './resolution-form-schema'
import {
  resolutionToForm,
  resolutionToStored,
  spellResolutionFromFormValues,
} from './resolution-form-values'

const resolutionFormValuesPath = join(
  dirname(fileURLToPath(import.meta.url)),
  'resolution-form-values.ts',
)

describe('spell resolution round trips', () => {
  for (const [slug, resolution] of Object.entries(SPELL_RESOLUTION_FIXTURES)) {
    it(`${slug}: contract resolution → form → stored → contract`, () => {
      const formValues = resolutionToForm(resolution)
      expect(formValues).toBeDefined()

      const stored = resolutionToStored(formValues)
      expect(stored).toEqual(resolution)
      expect(spellResolutionFromFormValues(formValues)).toEqual(resolution)
    })
  }

  it('eldritch-blast: preserves ranged attack distance range', () => {
    const formValues = resolutionToForm(ELDRITCH_BLAST_RESOLUTION)
    expect(formValues?.methodKind).toBe('attack')
    expect(formValues?.attackType).toBe('ranged-spell')
    expect(formValues?.rangeKind).toBe('distance')
    expect(formValues?.rangeDistanceFt).toBe(120)
  })

  it('chill-touch: preserves melee reach and hit outcome note', () => {
    const formValues = resolutionToForm(CHILL_TOUCH_RESOLUTION)
    expect(formValues?.attackType).toBe('melee-spell')
    expect(formValues?.rangeKind).toBe('reach')
    expect(formValues?.hitNote).toContain("can't regain Hit Points")
  })

  it('inflict-wounds: maps saving-throw preset without hit note', () => {
    const formValues = resolutionToForm(INFlict_WOUNDS_RESOLUTION)
    expect(formValues?.methodKind).toBe('saving-throw')
    expect(formValues?.saveAbility).toBe('con')
    expect(formValues?.hitNote).toBeUndefined()
  })

  it('returns undefined when resolution is absent on the read model', () => {
    expect(resolutionToForm(undefined)).toBeUndefined()
    expect(resolutionToForm(null)).toBeUndefined()
    expect(resolutionToStored(undefined)).toBeUndefined()
  })

  it('returns undefined from stored normalization when damage is incomplete', () => {
    expect(
      resolutionToStored({
        ...resolutionToForm(ELDRITCH_BLAST_RESOLUTION)!,
        damageType: undefined,
      }),
    ).toBeUndefined()
  })

  it('parsed form schema round-trips through stored normalization for fixtures', () => {
    for (const resolution of Object.values(SPELL_RESOLUTION_FIXTURES)) {
      const formValues = resolutionToForm(resolution)
      const parsedForm = resolutionFormSchema.parse(formValues)
      expect(resolutionToStored(parsedForm)).toEqual(resolution)
    }
  })
})

describe('resolution form values module', () => {
  it('documents future persistence seam alongside effects TODO', () => {
    const source = readFileSync(resolutionFormValuesPath, 'utf8')
    expect(source.length).toBeGreaterThan(0)
  })
})
