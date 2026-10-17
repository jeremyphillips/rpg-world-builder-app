import { describe, expect, it } from 'vitest'

import { formatCreatureCommunication } from './communication'

const formatLanguageLabel = (id: string) => id

describe('formatCreatureCommunication', () => {
  it('returns undefined when empty', () => {
    expect(formatCreatureCommunication({ languages: [] }, { formatLanguageLabel })).toBeUndefined()
  })

  it('formats spoken languages', () => {
    expect(
      formatCreatureCommunication(
        { languages: [{ language: 'common' }, { language: 'elvish' }] },
        { formatLanguageLabel },
      ),
    ).toBe('common, elvish')
  })

  it('formats understands-only and telepathy', () => {
    expect(
      formatCreatureCommunication(
        {
          languages: [{ language: 'common', speaks: false }],
          telepathy: 60,
        },
        { formatLanguageLabel },
      ),
    ).toBe("understands common but can't speak; telepathy 60 ft.")
  })
})
