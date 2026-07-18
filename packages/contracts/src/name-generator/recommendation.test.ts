import { describe, it } from 'vitest'

import { expectParseSuccess } from '../test/helpers/expect-zod-result'
import { namingContextSchema } from './recommendation'

describe('namingContextSchema', () => {
  it('accepts optional facet arrays', () => {
    expectParseSuccess(
      namingContextSchema.safeParse({
        subjectKind: 'person',
        languageIds: ['elvish'],
        cultureIds: ['elven'],
        speciesIds: ['srd-cc-5.2.1:elf'],
        creatureTypes: ['humanoid'],
        regionIds: ['west-africa'],
        fictionSettingIds: ['forgotten-realms'],
        tags: ['guild'],
      }),
    )
  })
})
