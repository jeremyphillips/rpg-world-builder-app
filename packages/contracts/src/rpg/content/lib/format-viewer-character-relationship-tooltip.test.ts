import { describe, expect, it } from 'vitest'

import { formatViewerCharacterRelationshipTooltip } from './format-viewer-character-relationship-tooltip'
import type { ViewerCharacterRelationships } from './viewer-character-relationship'

function envelope(
  input: Partial<ViewerCharacterRelationships> &
    Pick<ViewerCharacterRelationships, 'groups' | 'count'>,
): ViewerCharacterRelationships {
  return {
    presentation: input.presentation,
    groups: input.groups,
    count: input.count,
  }
}

describe('formatViewerCharacterRelationshipTooltip', () => {
  it('formats single-character class copy', () => {
    expect(
      formatViewerCharacterRelationshipTooltip(
        envelope({
          count: 1,
          groups: [
            {
              kind: 'class',
              count: 1,
              relationships: [{ kind: 'class', characterId: '1', characterName: 'Aric' }],
            },
          ],
        }),
      ),
    ).toBe('Class of Aric')
  })

  it('formats single-character subclass copy', () => {
    expect(
      formatViewerCharacterRelationshipTooltip(
        envelope({
          count: 1,
          groups: [
            {
              kind: 'subclass',
              count: 1,
              relationships: [{ kind: 'subclass', characterId: '1', characterName: 'Aric' }],
            },
          ],
        }),
      ),
    ).toBe('Subclass of Aric')
  })

  it('formats class overflow from group count', () => {
    expect(
      formatViewerCharacterRelationshipTooltip(
        envelope({
          count: 3,
          groups: [
            {
              kind: 'class',
              count: 3,
              relationships: [
                { kind: 'class', characterId: '1', characterName: 'Aric' },
                { kind: 'class', characterId: '2', characterName: 'Mira' },
              ],
            },
          ],
        }),
      ),
    ).toBe('Class of Aric, Mira, and 1 more')
  })

  it('formats mixed spell groups independently', () => {
    expect(
      formatViewerCharacterRelationshipTooltip(
        envelope({
          count: 4,
          groups: [
            {
              kind: 'knows',
              count: 3,
              relationships: [{ kind: 'knows', characterId: '2', characterName: 'Mira' }],
            },
            {
              kind: 'prepared',
              count: 1,
              relationships: [{ kind: 'prepared', characterId: '1', characterName: 'Aric' }],
            },
          ],
        }),
      ),
    ).toBe('Prepared by Aric · Known by Mira and 2 more')
  })

  it('formats has copy with presentation noun', () => {
    expect(
      formatViewerCharacterRelationshipTooltip(
        envelope({
          count: 1,
          groups: [
            {
              kind: 'has',
              count: 1,
              relationships: [{ kind: 'has', characterId: '1', characterName: 'Aric' }],
            },
          ],
          presentation: { hasNoun: 'feat' },
        }),
      ),
    ).toBe('Aric has this feat')
  })

  it('formats member copy', () => {
    expect(
      formatViewerCharacterRelationshipTooltip(
        envelope({
          count: 2,
          groups: [
            {
              kind: 'member',
              count: 2,
              relationships: [
                { kind: 'member', characterId: '1', characterName: 'Aric' },
                { kind: 'member', characterId: '2', characterName: 'Mira' },
              ],
            },
          ],
        }),
      ),
    ).toBe('Aric and Mira are members')
  })

  it('throws when formatting has without presentation noun', () => {
    expect(() =>
      formatViewerCharacterRelationshipTooltip(
        envelope({
          count: 1,
          groups: [
            {
              kind: 'has',
              count: 1,
              relationships: [{ kind: 'has', characterId: '1', characterName: 'Aric' }],
            },
          ],
        }),
      ),
    ).toThrow(/hasNoun/)
  })
})
