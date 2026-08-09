import { describe, expect, it } from 'vitest'

import {
  isCreateSetupChoiceSetComplete,
  resolveCreateSetupActiveChoiceSetId,
  resolveCreateSetupCanContinue,
  resolveCreateSetupChoiceSetExpanded,
  resolveCreateSetupVisibleChoiceSetIds,
  type CreateSetupChoiceSetSequenceItem,
} from './location-create-setup-sequence.lib'

function sets(
  items: Array<{ id: string; isComplete: boolean; required?: boolean }>,
): CreateSetupChoiceSetSequenceItem[] {
  return items
}

describe('location-create-setup-sequence', () => {
  describe('resolveCreateSetupActiveChoiceSetId', () => {
    it('returns null for an empty sequence', () => {
      expect(resolveCreateSetupActiveChoiceSetId({ choiceSets: [] })).toBeNull()
    })

    it('keeps a single incomplete set active', () => {
      expect(
        resolveCreateSetupActiveChoiceSetId({
          choiceSets: sets([{ id: 'siteType', isComplete: false }]),
        }),
      ).toBe('siteType')
    })

    it('keeps a single complete set active as terminal', () => {
      expect(
        resolveCreateSetupActiveChoiceSetId({
          choiceSets: sets([{ id: 'siteType', isComplete: true }]),
        }),
      ).toBe('siteType')
    })

    it('selects the first incomplete set in a multi-step flow', () => {
      expect(
        resolveCreateSetupActiveChoiceSetId({
          choiceSets: sets([
            { id: 'classification', isComplete: true },
            { id: 'regionType', isComplete: false },
            { id: 'extra', isComplete: false },
          ]),
        }),
      ).toBe('regionType')
    })

    it('selects the terminal set when all are complete', () => {
      expect(
        resolveCreateSetupActiveChoiceSetId({
          choiceSets: sets([
            { id: 'classification', isComplete: true },
            { id: 'regionType', isComplete: true },
            { id: 'extra', isComplete: true },
          ]),
        }),
      ).toBe('extra')
    })

    it('prefers a reopen id when it is still present', () => {
      expect(
        resolveCreateSetupActiveChoiceSetId({
          choiceSets: sets([
            { id: 'classification', isComplete: true },
            { id: 'regionType', isComplete: true },
          ]),
          reopenChoiceSetId: 'classification',
        }),
      ).toBe('classification')
    })

    it('ignores a reopen id that is no longer in the sequence', () => {
      expect(
        resolveCreateSetupActiveChoiceSetId({
          choiceSets: sets([
            { id: 'classification', isComplete: true },
            { id: 'regionType', isComplete: false },
          ]),
          reopenChoiceSetId: 'removed',
        }),
      ).toBe('regionType')
    })
  })

  describe('resolveCreateSetupChoiceSetExpanded', () => {
    it('expands only the active set', () => {
      expect(
        resolveCreateSetupChoiceSetExpanded({
          choiceSetId: 'classification',
          activeChoiceSetId: 'classification',
        }),
      ).toBe(true)
      expect(
        resolveCreateSetupChoiceSetExpanded({
          choiceSetId: 'regionType',
          activeChoiceSetId: 'classification',
        }),
      ).toBe(false)
    })
  })

  describe('resolveCreateSetupVisibleChoiceSetIds', () => {
    it('shows only the active set when nothing is complete', () => {
      expect(
        resolveCreateSetupVisibleChoiceSetIds({
          choiceSets: sets([
            { id: 'a', isComplete: false },
            { id: 'b', isComplete: false },
            { id: 'c', isComplete: false },
          ]),
          activeChoiceSetId: 'a',
        }),
      ).toEqual(['a'])
    })

    it('reveals the next set after the first completes', () => {
      expect(
        resolveCreateSetupVisibleChoiceSetIds({
          choiceSets: sets([
            { id: 'a', isComplete: true },
            { id: 'b', isComplete: false },
            { id: 'c', isComplete: false },
          ]),
          activeChoiceSetId: 'b',
        }),
      ).toEqual(['a', 'b'])
    })

    it('shows completed predecessors plus terminal when all complete', () => {
      expect(
        resolveCreateSetupVisibleChoiceSetIds({
          choiceSets: sets([
            { id: 'a', isComplete: true },
            { id: 'b', isComplete: true },
            { id: 'c', isComplete: true },
          ]),
          activeChoiceSetId: 'c',
        }),
      ).toEqual(['a', 'b', 'c'])
    })

    it('when reopening an earlier set, hides later incomplete unlock and keeps completed predecessors', () => {
      expect(
        resolveCreateSetupVisibleChoiceSetIds({
          choiceSets: sets([
            { id: 'a', isComplete: true },
            { id: 'b', isComplete: true },
            { id: 'c', isComplete: true },
          ]),
          activeChoiceSetId: 'a',
        }),
      ).toEqual(['a'])
    })
  })

  describe('resolveCreateSetupCanContinue', () => {
    it('is false until every required set is complete', () => {
      expect(
        resolveCreateSetupCanContinue({
          choiceSets: sets([
            { id: 'a', isComplete: true },
            { id: 'b', isComplete: false },
          ]),
        }),
      ).toBe(false)
    })

    it('is true when all required sets are complete', () => {
      expect(
        resolveCreateSetupCanContinue({
          choiceSets: sets([
            { id: 'a', isComplete: true },
            { id: 'b', isComplete: true },
          ]),
        }),
      ).toBe(true)
    })

    it('ignores optional incomplete sets', () => {
      expect(
        resolveCreateSetupCanContinue({
          choiceSets: sets([
            { id: 'a', isComplete: true },
            { id: 'b', isComplete: false, required: false },
          ]),
        }),
      ).toBe(true)
    })

    it('is false for an empty sequence', () => {
      expect(resolveCreateSetupCanContinue({ choiceSets: [] })).toBe(false)
    })
  })

  describe('isCreateSetupChoiceSetComplete', () => {
    it('treats non-empty values as complete', () => {
      expect(isCreateSetupChoiceSetComplete('city')).toBe(true)
      expect(isCreateSetupChoiceSetComplete('')).toBe(false)
      expect(isCreateSetupChoiceSetComplete(null)).toBe(false)
    })
  })
})
