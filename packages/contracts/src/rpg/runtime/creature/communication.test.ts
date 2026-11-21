import { describe, expect, it } from 'vitest'

import { formatCreatureCommunication, formatExperiencePoints } from './communication'

const formatLanguageLabel = (id: string) => id

describe('formatExperiencePoints', () => {
  it('groups thousands in the XP amount', () => {
    expect(formatExperiencePoints(25_000)).toBe('XP 25,000')
    expect(formatExperiencePoints(700)).toBe('XP 700')
  })
})

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
