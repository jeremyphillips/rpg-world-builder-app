import { describe, expect, it } from 'vitest'
import { loadSeedClasses } from '@rpg/catalog/classes'

import { HttpError } from '../../../lib/http-error'
import {
  assertSpeciesClassSlugsExist,
  assertSpeciesClassSlugsFromInput,
} from './assert-species-class-slugs'

const SRD_CLASSES = loadSeedClasses('srd-cc-5.2.1')

describe('assertSpeciesClassSlugsExist', () => {
  it('accepts known class slugs', () => {
    expect(() => assertSpeciesClassSlugsExist(['fighter', 'wizard'], SRD_CLASSES)).not.toThrow()
  })

  it('rejects unknown class slugs', () => {
    expect(() => assertSpeciesClassSlugsExist(['not-a-class'], SRD_CLASSES)).toThrow(HttpError)
    try {
      assertSpeciesClassSlugsExist(['not-a-class'], SRD_CLASSES)
    } catch (err) {
      expect(err).toMatchObject({ status: 400, code: 'validation_error' })
      expect((err as HttpError).message).toContain('Unknown class')
    }
  })

  it('no-ops for an empty slug list', () => {
    expect(() => assertSpeciesClassSlugsExist([], SRD_CLASSES)).not.toThrow()
  })
})

describe('assertSpeciesClassSlugsFromInput', () => {
  it('collects slugs from multiclassing classPolicy and levelLimits caps', () => {
    expect(() =>
      assertSpeciesClassSlugsFromInput(
        {
          characterCreation: {
            multiclassing: {
              policy: 'restricted',
              classPolicy: { mode: 'only', classIds: ['fighter'] },
            },
            levelLimits: {
              maxCharacterLevel: null,
              classLevelCaps: [{ classId: 'wizard', maxLevel: 5 }],
            },
          },
        },
        SRD_CLASSES,
      ),
    ).not.toThrow()
  })

  it('rejects unknown slugs in characterCreation', () => {
    expect(() =>
      assertSpeciesClassSlugsFromInput(
        {
          characterCreation: {
            multiclassing: {
              policy: 'restricted',
              classPolicy: { mode: 'only', classIds: ['not-a-class'] },
            },
          },
        },
        SRD_CLASSES,
      ),
    ).toThrow(HttpError)
  })
})
