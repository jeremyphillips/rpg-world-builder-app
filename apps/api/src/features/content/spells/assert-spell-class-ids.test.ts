import { describe, expect, it } from 'vitest'
import { loadSeedClasses } from '@rpg/catalog/classes'

import { HttpError } from '../../../lib/http-error'
import { assertSpellClassIdsHaveSpellcasting } from './assert-spell-class-ids'

const SRD_CLASSES = loadSeedClasses('srd-cc-5.2.1')

describe('assertSpellClassIdsHaveSpellcasting', () => {
  it('accepts class slugs with spellcasting', () => {
    expect(() => assertSpellClassIdsHaveSpellcasting(['wizard'], SRD_CLASSES)).not.toThrow()
  })

  it('rejects unknown class slugs', () => {
    expect(() => assertSpellClassIdsHaveSpellcasting(['not-a-class'], SRD_CLASSES)).toThrow(
      HttpError,
    )
    try {
      assertSpellClassIdsHaveSpellcasting(['not-a-class'], SRD_CLASSES)
    } catch (err) {
      expect(err).toMatchObject({ status: 400, code: 'validation_error' })
      expect((err as HttpError).message).toContain('Unknown class')
      expect((err as HttpError).message).toContain('not-a-class')
    }
  })

  it('rejects classes without spellcasting', () => {
    expect(() => assertSpellClassIdsHaveSpellcasting(['fighter'], SRD_CLASSES)).toThrow(HttpError)
    try {
      assertSpellClassIdsHaveSpellcasting(['fighter'], SRD_CLASSES)
    } catch (err) {
      expect(err).toMatchObject({ status: 400, code: 'validation_error' })
      expect((err as HttpError).message).toContain('without spellcasting')
      expect((err as HttpError).message).toContain('Fighter')
    }
  })

  it('reports both unknown slugs and non-casters in one error', () => {
    try {
      assertSpellClassIdsHaveSpellcasting(['fighter', 'not-a-class'], SRD_CLASSES)
    } catch (err) {
      expect((err as HttpError).message).toContain('Unknown class')
      expect((err as HttpError).message).toContain('without spellcasting')
    }
  })
})
