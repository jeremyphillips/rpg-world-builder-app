import { describe, expect, it } from 'vitest'

import { getAbilityLabel } from '../../vocab/ability'
import { characterBuilderAbilityRecommendationMessages } from './ability/ability-score-recommendation-messages'
import {
  canAutoFillEmptyAbilities,
  clearAllAbilityScores,
  deriveAbilityAssignmentPriority,
  deriveAbilityScoreRecommendations,
  fillEmptyAbilitiesWithClassRecommendations,
  formatAbilityRecommendationBenefit,
  formatAbilityRecommendationSuggestedInline,
  isSuggestedAssignmentSatisfied,
  mergeSuggestedAssignmentIntoScores,
  resolveAbilityScorePoolActionState,
  resolveSuggestedAssignmentActionState,
  shuffleAbilityScores,
  willSuggestedAssignmentReplaceExisting,
} from './ability-score-recommendations'

describe('deriveAbilityAssignmentPriority', () => {
  it('places primaryAbilities first and appends remaining ABILITY_IDS', () => {
    expect(deriveAbilityAssignmentPriority(['str', 'dex'])).toEqual([
      'str',
      'dex',
      'con',
      'int',
      'wis',
      'cha',
    ])
  })

  it('dedupes primaryAbilities entries', () => {
    expect(deriveAbilityAssignmentPriority(['str', 'str', 'dex'])).toEqual([
      'str',
      'dex',
      'con',
      'int',
      'wis',
      'cha',
    ])
  })
})

describe('canAutoFillEmptyAbilities', () => {
  const source = [15, 14, 13, 12, 10, 8] as const

  it('returns true when pool scores remain', () => {
    expect(canAutoFillEmptyAbilities({ str: 15 }, source)).toBe(true)
  })

  it('returns false when all scores are assigned', () => {
    expect(
      canAutoFillEmptyAbilities({ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 }, source),
    ).toBe(false)
  })
})

describe('fillEmptyAbilitiesWithClassRecommendations', () => {
  const source = [15, 14, 13, 12, 10, 8] as const
  const fighterPrimary = ['str', 'dex'] as const
  const identityShuffle = (scores: readonly number[]) => [...scores]

  it('fills recommended abilities deterministically and shuffles non-recommended scores', () => {
    const result = fillEmptyAbilitiesWithClassRecommendations(
      {},
      source,
      fighterPrimary,
      identityShuffle,
    )

    expect(result).toEqual({
      str: 15,
      dex: 14,
      con: 13,
      int: 12,
      wis: 10,
      cha: 8,
    })
  })

  it('produces different non-recommended assignments when shuffle order changes', () => {
    const identityShuffle = (scores: readonly number[]) => [...scores]
    const reverseShuffle = (scores: readonly number[]) => [...scores].reverse()

    const first = fillEmptyAbilitiesWithClassRecommendations(
      {},
      source,
      fighterPrimary,
      identityShuffle,
    )
    const second = fillEmptyAbilitiesWithClassRecommendations(
      {},
      source,
      fighterPrimary,
      reverseShuffle,
    )

    expect(first.str).toBe(15)
    expect(first.dex).toBe(14)
    expect(second.str).toBe(15)
    expect(second.dex).toBe(14)
    expect(first).not.toEqual(second)
  })

  it('preserves existing assignments and fills recommended abilities next', () => {
    expect(
      fillEmptyAbilitiesWithClassRecommendations(
        { con: 15 },
        source,
        fighterPrimary,
        identityShuffle,
      ),
    ).toEqual({
      con: 15,
      str: 14,
      dex: 13,
      int: 12,
      wis: 10,
      cha: 8,
    })
  })

  it('does not overwrite assigned abilities', () => {
    expect(
      fillEmptyAbilitiesWithClassRecommendations(
        { str: 8, con: 15 },
        source,
        fighterPrimary,
        identityShuffle,
      ),
    ).toEqual({
      str: 8,
      con: 15,
      dex: 14,
      int: 13,
      wis: 12,
      cha: 10,
    })
  })

  it('returns current scores unchanged when the pool is empty', () => {
    const current = { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 }
    expect(
      fillEmptyAbilitiesWithClassRecommendations(current, source, fighterPrimary, identityShuffle),
    ).toEqual(current)
  })
})

describe('shuffleAbilityScores', () => {
  it('returns a permutation of the input scores', () => {
    const source = [15, 14, 13, 12, 10, 8]
    const shuffled = shuffleAbilityScores(source, () => 0)

    expect(shuffled.toSorted((left, right) => left - right)).toEqual(
      source.toSorted((left, right) => left - right),
    )
    expect(shuffled).not.toEqual(source)
  })
})

describe('resolveAbilityScorePoolActionState', () => {
  it('returns hidden when no class is selected', () => {
    expect(resolveAbilityScorePoolActionState({}, false)).toBe('hidden')
    expect(resolveAbilityScorePoolActionState({ str: 15 }, false)).toBe('hidden')
  })

  it('returns auto-fill when a class is selected and fewer than six scores are assigned', () => {
    expect(resolveAbilityScorePoolActionState({}, true)).toBe('auto-fill')
    expect(resolveAbilityScorePoolActionState({ str: 15 }, true)).toBe('auto-fill')
  })

  it('returns clear when all six scores are assigned', () => {
    expect(
      resolveAbilityScorePoolActionState(
        { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
        true,
      ),
    ).toBe('clear')
  })
})

describe('clearAllAbilityScores', () => {
  it('returns an empty scores object', () => {
    expect(clearAllAbilityScores()).toEqual({})
  })
})

describe('deriveAbilityScoreRecommendations', () => {
  it('returns null when no class is selected', () => {
    expect(deriveAbilityScoreRecommendations([], [15, 14, 13, 12, 10, 8])).toBeNull()
  })

  it('derives primary and secondary abilities from a single class', () => {
    const result = deriveAbilityScoreRecommendations([
      { className: 'Fighter', primaryAbilities: ['str', 'dex'] },
    ])

    expect(result).toEqual({
      primary: ['str'],
      secondary: ['dex'],
    })
  })

  it('pairs highest source-array scores with primaryAbilities in order', () => {
    const result = deriveAbilityScoreRecommendations(
      [{ className: 'Fighter', primaryAbilities: ['str', 'dex'] }],
      [15, 14, 13, 12, 10, 8],
    )

    expect(result?.suggestedAssignment).toEqual({
      str: 15,
      dex: 14,
    })
  })

  it('derives suggested assignment from source array regardless of current assignments', () => {
    const result = deriveAbilityScoreRecommendations(
      [{ className: 'Fighter', primaryAbilities: ['str', 'dex'] }],
      [15, 14, 13, 12, 10, 8],
    )

    expect(result?.suggestedAssignment).toEqual({ str: 15, dex: 14 })
  })

  it('omits suggested assignment when no score source is provided', () => {
    const result = deriveAbilityScoreRecommendations([
      { className: 'Wizard', primaryAbilities: ['int'] },
    ])

    expect(result).toEqual({
      primary: ['int'],
      secondary: [],
    })
    expect(result?.suggestedAssignment).toBeUndefined()
  })
})

describe('formatAbilityRecommendationBenefit', () => {
  it('formats dual-primary fighter benefit copy with plural verb', () => {
    expect(
      formatAbilityRecommendationBenefit({
        className: 'Fighter',
        primaryAbilities: ['str', 'dex'],
      }),
    ).toBe(
      characterBuilderAbilityRecommendationMessages.benefit({
        classNamePlural: 'Fighters',
        abilitiesOrList: `${getAbilityLabel('str')} or ${getAbilityLabel('dex')}`,
        verb: 'are',
      }),
    )
  })

  it('formats single-primary cleric benefit copy with singular verb', () => {
    expect(
      formatAbilityRecommendationBenefit({
        className: 'Cleric',
        primaryAbilities: ['wis'],
      }),
    ).toBe(
      characterBuilderAbilityRecommendationMessages.benefit({
        classNamePlural: 'Clerics',
        abilitiesOrList: getAbilityLabel('wis'),
        verb: 'is',
      }),
    )
  })
})

describe('formatAbilityRecommendationSuggestedInline', () => {
  it('joins suggested pairs into inline copy', () => {
    expect(formatAbilityRecommendationSuggestedInline(['15 → Strength', '14 → Dexterity'])).toBe(
      characterBuilderAbilityRecommendationMessages.suggestedInline({
        pairs: '15 → Strength, 14 → Dexterity',
      }),
    )
  })
})

describe('isSuggestedAssignmentSatisfied', () => {
  const suggestion = { str: 15, dex: 14 } as const

  it('returns true when suggested pairs match and no other abilities are assigned', () => {
    expect(isSuggestedAssignmentSatisfied({ str: 15, dex: 14 }, suggestion)).toBe(true)
  })

  it('returns true when suggested pairs match even when extra abilities are assigned', () => {
    expect(isSuggestedAssignmentSatisfied({ str: 15, dex: 14, cha: 8 }, suggestion)).toBe(true)
  })

  it('returns false when a suggested pair does not match', () => {
    expect(isSuggestedAssignmentSatisfied({ str: 13, dex: 14 }, suggestion)).toBe(false)
  })
})

describe('resolveSuggestedAssignmentActionState', () => {
  const suggestion = { str: 15, dex: 14 } as const

  it('returns satisfied when the suggestion is already reflected in form state', () => {
    expect(resolveSuggestedAssignmentActionState({ str: 15, dex: 14 }, suggestion)).toBe(
      'satisfied',
    )
  })

  it('returns unapplied when nothing conflicts with applying the suggestion', () => {
    expect(resolveSuggestedAssignmentActionState({}, suggestion)).toBe('unapplied')
  })

  it('returns wouldReplace when applying would overwrite or relocate assignments', () => {
    expect(resolveSuggestedAssignmentActionState({ cha: 15 }, suggestion)).toBe('wouldReplace')
    expect(resolveSuggestedAssignmentActionState({ str: 13, dex: 14 }, suggestion)).toBe(
      'wouldReplace',
    )
  })

  it('returns unapplied when extra assignments do not conflict with the suggestion', () => {
    expect(resolveSuggestedAssignmentActionState({ wis: 10, con: 13 }, suggestion)).toBe(
      'unapplied',
    )
  })
})

describe('willSuggestedAssignmentReplaceExisting', () => {
  const suggestion = { str: 15, dex: 14 } as const

  it('returns false when no scores are assigned', () => {
    expect(willSuggestedAssignmentReplaceExisting({}, suggestion)).toBe(false)
  })

  it('returns false when current scores match the suggestion exactly', () => {
    expect(willSuggestedAssignmentReplaceExisting({ str: 15, dex: 14 }, suggestion)).toBe(false)
  })

  it('returns true when a suggested ability has a different score', () => {
    expect(willSuggestedAssignmentReplaceExisting({ str: 13, dex: 14 }, suggestion)).toBe(true)
  })

  it('returns false when extra non-suggested abilities are assigned', () => {
    expect(willSuggestedAssignmentReplaceExisting({ wis: 10, con: 13 }, suggestion)).toBe(false)
  })

  it('returns true when a non-suggested ability holds a score needed by the suggestion', () => {
    expect(willSuggestedAssignmentReplaceExisting({ cha: 15 }, suggestion)).toBe(true)
  })
})

describe('mergeSuggestedAssignmentIntoScores', () => {
  const suggestion = { str: 15, dex: 14 } as const

  it('assigns suggested pairs on an empty board', () => {
    expect(mergeSuggestedAssignmentIntoScores({}, suggestion)).toEqual({
      str: 15,
      dex: 14,
    })
  })

  it('preserves assignments outside the suggestion', () => {
    expect(mergeSuggestedAssignmentIntoScores({ wis: 10, con: 13 }, suggestion)).toEqual({
      str: 15,
      dex: 14,
      wis: 10,
      con: 13,
    })
  })

  it('returns a displaced score to the pool when the target ability already had one', () => {
    expect(mergeSuggestedAssignmentIntoScores({ wis: 8, str: 13 }, { wis: 15 })).toEqual({
      wis: 15,
      str: 13,
    })
  })

  it('relocates a score token when it is already assigned elsewhere', () => {
    expect(mergeSuggestedAssignmentIntoScores({ cha: 15 }, suggestion)).toEqual({
      str: 15,
      dex: 14,
    })
  })
})
