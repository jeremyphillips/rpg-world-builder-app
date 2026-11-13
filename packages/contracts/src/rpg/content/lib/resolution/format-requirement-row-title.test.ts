import { describe, expect, it } from 'vitest'

import { formatResolutionTargetSentence } from './format-target-composition'
import { formatResolutionRequirementRowTitle } from './format-requirement-row-title'

const creatureTypeLabel = (id: string) =>
  ({ humanoid: 'Humanoid', giant: 'Giant', undead: 'Undead', fiend: 'Fiend' })[id] ?? id

describe('formatResolutionRequirementRowTitle', () => {
  it('uses incomplete type labels until meaningful values exist', () => {
    expect(formatResolutionRequirementRowTitle({ kind: 'size', comparison: 'or-smaller' })).toBe(
      'Creature size',
    )
    expect(formatResolutionRequirementRowTitle({ kind: 'creature-type', mode: 'include' })).toBe(
      'Creature type',
    )
    expect(formatResolutionRequirementRowTitle({ kind: 'condition', presence: 'has' })).toBe(
      'Condition',
    )
    expect(formatResolutionRequirementRowTitle({ kind: 'any-of' })).toBe(
      'Willing or has a condition',
    )
    expect(formatResolutionRequirementRowTitle({ kind: 'any-of', willing: false })).toBe(
      'Willing or has a condition',
    )
    expect(formatResolutionRequirementRowTitle({ kind: 'written', text: '  ' })).toBe(
      'Custom requirement',
    )
    expect(formatResolutionRequirementRowTitle({ kind: 'sight' })).toBe('Sight')
  })

  it('formats configured sight, size, and willing rows', () => {
    expect(formatResolutionRequirementRowTitle({ kind: 'sight', who: 'actor' })).toBe(
      'You can see it',
    )
    expect(formatResolutionRequirementRowTitle({ kind: 'sight', who: 'both' })).toBe(
      'You and the target can see each other',
    )
    expect(
      formatResolutionRequirementRowTitle({
        kind: 'size',
        bound: 'large',
        comparison: 'or-smaller',
      }),
    ).toBe('Large or smaller')
    expect(
      formatResolutionRequirementRowTitle({
        kind: 'size',
        bound: 'huge',
        comparison: 'only',
      }),
    ).toBe('Huge only')
    expect(formatResolutionRequirementRowTitle({ kind: 'willing' })).toBe('Willing')
  })

  it('formats creature-type include and exclude titles', () => {
    expect(
      formatResolutionRequirementRowTitle(
        { kind: 'creature-type', mode: 'include', ids: ['humanoid'] },
        { creatureTypeLabel },
      ),
    ).toBe('Humanoid')
    expect(
      formatResolutionRequirementRowTitle(
        { kind: 'creature-type', mode: 'include', ids: ['humanoid', 'giant'] },
        { creatureTypeLabel },
      ),
    ).toBe('Humanoid or Giant')
    expect(
      formatResolutionRequirementRowTitle(
        { kind: 'creature-type', mode: 'exclude', ids: ['undead'] },
        { creatureTypeLabel },
      ),
    ).toBe('Not Undead')
    expect(
      formatResolutionRequirementRowTitle(
        { kind: 'creature-type', mode: 'exclude', ids: ['undead', 'fiend'] },
        { creatureTypeLabel },
      ),
    ).toBe('Excludes Undead and Fiend')
  })

  it('formats condition presence and multiplicity', () => {
    expect(
      formatResolutionRequirementRowTitle({
        kind: 'condition',
        presence: 'has',
        ids: ['prone'],
      }),
    ).toBe('Has the Prone condition')
    expect(
      formatResolutionRequirementRowTitle({
        kind: 'condition',
        presence: 'lacks',
        ids: ['prone'],
      }),
    ).toBe('Does not have the Prone condition')
    expect(
      formatResolutionRequirementRowTitle({
        kind: 'condition',
        presence: 'has',
        ids: ['prone', 'grappled', 'restrained'],
      }),
    ).toBe('Has any of these conditions: Prone, Grappled, or Restrained')
    expect(
      formatResolutionRequirementRowTitle({
        kind: 'condition',
        presence: 'lacks',
        ids: ['prone', 'grappled'],
      }),
    ).toBe('Has none of these conditions: Prone or Grappled')
  })

  it('formats any-of branches without hiding incomplete intent', () => {
    expect(formatResolutionRequirementRowTitle({ kind: 'any-of', willing: true })).toBe('Willing')
    expect(
      formatResolutionRequirementRowTitle({
        kind: 'any-of',
        conditionIds: ['grappled'],
      }),
    ).toBe('Has the Grappled condition')
    expect(
      formatResolutionRequirementRowTitle({
        kind: 'any-of',
        willing: true,
        conditionIds: ['grappled'],
      }),
    ).toBe('Willing or has the Grappled condition')
    expect(
      formatResolutionRequirementRowTitle({
        kind: 'any-of',
        willing: true,
        conditionIds: ['grappled', 'restrained'],
      }),
    ).toBe('Willing or has any of these conditions: Grappled or Restrained')
  })

  it('falls back safely for unknown kinds and condition ids', () => {
    expect(formatResolutionRequirementRowTitle({ kind: 'disposition' })).toBe('Requirement')
    expect(
      formatResolutionRequirementRowTitle({
        kind: 'condition',
        presence: 'has',
        ids: ['not-a-real-condition'],
      }),
    ).toBe('Condition')
  })

  it('does not change stat-block sentence formatting', () => {
    const target = {
      count: 1,
      kind: 'creature' as const,
      proximity: { kind: 'distance' as const, distance: { value: 5, unit: 'ft' as const } },
      requirements: [
        { kind: 'size', bound: 'large', comparison: 'or-smaller' },
        { kind: 'sight', who: 'actor' },
      ],
    }
    expect(formatResolutionTargetSentence(target)).toBe(
      'One Large or smaller creature you can see within 5 feet',
    )
  })
})
