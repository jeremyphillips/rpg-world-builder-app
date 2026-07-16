import { describe, it } from 'vitest'

import { expectParseFailure, expectParseSuccess } from '../test/helpers/expect-zod-result'
import { namingAssociationSchema } from './naming-association'

describe('namingAssociationSchema', () => {
  it('accepts all association kinds', () => {
    const kinds = [
      { kind: 'language' as const, languageId: 'elvish', strength: 'primary' as const },
      { kind: 'culture' as const, cultureId: 'high-elven' },
      { kind: 'species' as const, speciesId: 'srd-cc-5.2.1:elf' },
      { kind: 'creatureType' as const, creatureType: 'dragon' },
      { kind: 'region' as const, regionId: 'west-africa' },
      { kind: 'fictionSetting' as const, fictionSettingId: 'forgotten-realms' },
    ]

    for (const association of kinds) {
      expectParseSuccess(namingAssociationSchema.safeParse(association))
    }
  })

  it('rejects unknown kinds', () => {
    expectParseFailure(namingAssociationSchema.safeParse({ kind: 'ethnicity', id: 'x' }), {
      message: /invalid/i,
    })
  })
})
