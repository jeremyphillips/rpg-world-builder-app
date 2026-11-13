import { describe, expect, it } from 'vitest'

import {
  formatResolutionTargetSentence,
  formatTargetHeadNoun,
  formatTargetQualifyingClauses,
  formatTargetSightPhrase,
  resolutionTargetCountSelectOptions,
} from './format-target-composition'

const withinFive = { kind: 'distance' as const, distance: { value: 5, unit: 'ft' as const } }
const withinThirty = { kind: 'distance' as const, distance: { value: 30, unit: 'ft' as const } }

describe('resolution target count select options', () => {
  it('lists one through ten as word labels', () => {
    expect(resolutionTargetCountSelectOptions()).toEqual([
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
      { value: 3, label: 'Three' },
      { value: 4, label: 'Four' },
      { value: 5, label: 'Five' },
      { value: 6, label: 'Six' },
      { value: 7, label: 'Seven' },
      { value: 8, label: 'Eight' },
      { value: 9, label: 'Nine' },
      { value: 10, label: 'Ten' },
    ])
  })
})

describe('resolution target sentence composition', () => {
  it('places size and sight before the distance', () => {
    expect(
      formatResolutionTargetSentence({
        count: 1,
        kind: 'creature',
        proximity: withinFive,
        requirements: [
          { kind: 'size', bound: 'large', comparison: 'or-smaller' },
          { kind: 'sight', who: 'actor' },
        ],
      }),
    ).toBe('One Large or smaller creature you can see within 5 feet')
  })

  it('places willing and an included type before the noun', () => {
    expect(
      formatResolutionTargetSentence({
        count: 3,
        countKind: 'up-to',
        kind: 'creature',
        proximity: withinThirty,
        requirements: [
          { kind: 'willing' },
          { kind: 'creature-type', mode: 'include', ids: ['humanoid'] },
        ],
      }),
    ).toBe('Up to three willing Humanoids within 30 feet')
    expect(
      formatTargetHeadNoun({
        count: 1,
        kind: 'creature',
        requirements: [{ kind: 'creature-type', mode: 'include', ids: ['humanoid', 'giant'] }],
      }),
    ).toBe('Humanoid or Giant')
  })

  it('places conditions after the distance, including any-of', () => {
    expect(
      formatResolutionTargetSentence({
        count: 1,
        kind: 'creature',
        proximity: withinFive,
        requirements: [{ kind: 'condition', presence: 'has', ids: ['prone'] }],
      }),
    ).toBe('One creature within 5 feet that has the Prone condition')
    expect(
      formatTargetQualifyingClauses({
        kind: 'creature',
        requirements: [
          { kind: 'condition', presence: 'has', ids: ['grappled', 'incapacitated', 'restrained'] },
        ],
      }),
    ).toEqual(['that has the Grappled, Incapacitated, or Restrained condition'])
    expect(
      formatResolutionTargetSentence({
        count: 1,
        kind: 'creature',
        proximity: withinFive,
        requirements: [
          {
            kind: 'any-of',
            willing: true,
            conditionIds: ['grappled', 'incapacitated', 'restrained'],
          },
        ],
      }),
    ).toBe(
      'One creature within 5 feet that is willing or has the Grappled, Incapacitated, or Restrained condition',
    )
  })

  it('excludes types as a clause and appends a written clause unchanged', () => {
    expect(
      formatTargetQualifyingClauses({
        kind: 'creature',
        requirements: [{ kind: 'creature-type', mode: 'exclude', ids: ['undead'] }],
      }),
    ).toEqual(["that isn't an Undead"])
    expect(
      formatTargetQualifyingClauses({
        kind: 'creature',
        requirements: [{ kind: 'creature-type', mode: 'exclude', ids: ['undead', 'construct'] }],
      }),
    ).toEqual(["that isn't an Undead or a Construct"])
    expect(
      formatResolutionTargetSentence({
        count: 1,
        kind: 'creature',
        proximity: withinFive,
        requirements: [{ kind: 'willing' }, { kind: 'written', text: 'that is a demon' }],
      }),
    ).toBe('One willing creature within 5 feet that is a demon')
    expect(
      formatResolutionTargetSentence({
        count: 1,
        kind: 'creature',
        proximity: withinFive,
        requirements: [{ kind: 'written', text: 'demon' }],
      }),
    ).toBe('One creature within 5 feet demon')
  })

  it('keeps a plain target sentence and sight phrases', () => {
    expect(
      formatResolutionTargetSentence({
        count: 1,
        kind: 'creature-or-object',
        proximity: { kind: 'distance', distance: { value: 120, unit: 'ft' } },
      }),
    ).toBe('One creature or object within 120 feet')
    expect(formatTargetSightPhrase([{ kind: 'sight', who: 'target' }])).toBe('that can see you')
    expect(
      formatResolutionTargetSentence({
        count: 1,
        kind: 'creature',
        proximity: { kind: 'touch' },
      }),
    ).toBe('One creature you touch')
    expect(
      formatResolutionTargetSentence({
        count: 1,
        kind: 'creature',
        proximity: { kind: 'reach', distance: { value: 5, unit: 'ft' } },
      }),
    ).toBe('One creature within 5 feet')
  })
})
