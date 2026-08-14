import { describe, expect, it } from 'vitest'

import {
  isCreateSetupChoiceComplete,
  isCreateSetupNumberComplete,
  resolveCreateSetupActiveSetId,
  resolveCreateSetupCanContinue,
  resolveCreateSetupSetExpanded,
  resolveCreateSetupSetIdsToInvalidate,
  resolveCreateSetupVisibleSetIds,
} from './create-setup-sequence.lib'
import type { CreateSetupSequenceItem } from './create-setup.types'

function sequence(
  items: Array<{
    id: string
    isComplete: boolean
    required?: boolean
    collapseWhenComplete?: boolean
  }>,
): CreateSetupSequenceItem[] {
  return items
}

describe('create-setup-sequence', () => {
  describe('resolveCreateSetupActiveSetId', () => {
    it('returns null for an empty sequence', () => {
      expect(resolveCreateSetupActiveSetId({ sets: [] })).toBeNull()
    })

    it('keeps a single incomplete set active', () => {
      expect(
        resolveCreateSetupActiveSetId({
          sets: sequence([{ id: 'siteType', isComplete: false }]),
        }),
      ).toBe('siteType')
    })

    it('keeps a single complete set active as terminal', () => {
      expect(
        resolveCreateSetupActiveSetId({
          sets: sequence([{ id: 'siteType', isComplete: true }]),
        }),
      ).toBe('siteType')
    })

    it('selects the first incomplete set in a multi-step flow', () => {
      expect(
        resolveCreateSetupActiveSetId({
          sets: sequence([
            { id: 'classification', isComplete: true },
            { id: 'regionType', isComplete: false },
            { id: 'extra', isComplete: false },
          ]),
        }),
      ).toBe('regionType')
    })

    it('skips incomplete optional sets and activates the first incomplete required set', () => {
      expect(
        resolveCreateSetupActiveSetId({
          sets: sequence([
            { id: 'form', isComplete: false, required: false },
            { id: 'facility', isComplete: false, required: false },
            { id: 'operator', isComplete: false },
          ]),
        }),
      ).toBe('operator')
    })

    it('selects the terminal set when all are complete', () => {
      expect(
        resolveCreateSetupActiveSetId({
          sets: sequence([
            { id: 'classification', isComplete: true },
            { id: 'regionType', isComplete: true },
            { id: 'extra', isComplete: true },
          ]),
        }),
      ).toBe('extra')
    })

    it('prefers a reopen id when it is still present', () => {
      expect(
        resolveCreateSetupActiveSetId({
          sets: sequence([
            { id: 'classification', isComplete: true },
            { id: 'regionType', isComplete: true },
          ]),
          reopenSetId: 'classification',
        }),
      ).toBe('classification')
    })

    it('ignores a reopen id that is no longer in the sequence', () => {
      expect(
        resolveCreateSetupActiveSetId({
          sets: sequence([
            { id: 'classification', isComplete: true },
            { id: 'regionType', isComplete: false },
          ]),
          reopenSetId: 'removed',
        }),
      ).toBe('regionType')
    })

    it('skips a complete number set and activates the next incomplete set', () => {
      expect(
        resolveCreateSetupActiveSetId({
          sets: sequence([
            { id: 'species', isComplete: true },
            { id: 'level', isComplete: true, collapseWhenComplete: false },
            { id: 'class', isComplete: false },
          ]),
        }),
      ).toBe('class')
    })
  })

  describe('resolveCreateSetupSetExpanded', () => {
    it('expands only the active set when collapseWhenComplete defaults to true', () => {
      expect(
        resolveCreateSetupSetExpanded({
          setId: 'classification',
          activeSetId: 'classification',
          visible: true,
          isComplete: false,
        }),
      ).toBe(true)
      expect(
        resolveCreateSetupSetExpanded({
          setId: 'regionType',
          activeSetId: 'classification',
          visible: true,
          isComplete: false,
        }),
      ).toBe(false)
    })

    it('keeps visible sets expanded when collapseWhenComplete is false', () => {
      expect(
        resolveCreateSetupSetExpanded({
          setId: 'level',
          activeSetId: 'class',
          visible: true,
          isComplete: true,
          collapseWhenComplete: false,
        }),
      ).toBe(true)
    })

    it('keeps a visible incomplete optional set expanded', () => {
      expect(
        resolveCreateSetupSetExpanded({
          setId: 'facility',
          activeSetId: 'operator',
          visible: true,
          isComplete: false,
          required: false,
        }),
      ).toBe(true)
    })
  })

  describe('resolveCreateSetupVisibleSetIds', () => {
    it('shows only the active set when nothing is complete', () => {
      expect(
        resolveCreateSetupVisibleSetIds({
          sets: sequence([
            { id: 'a', isComplete: false },
            { id: 'b', isComplete: false },
            { id: 'c', isComplete: false },
          ]),
          activeSetId: 'a',
        }),
      ).toEqual(['a'])
    })

    it('reveals the next set after the first completes', () => {
      expect(
        resolveCreateSetupVisibleSetIds({
          sets: sequence([
            { id: 'a', isComplete: true },
            { id: 'b', isComplete: false },
            { id: 'c', isComplete: false },
          ]),
          activeSetId: 'b',
        }),
      ).toEqual(['a', 'b'])
    })

    it('reveals incomplete optional predecessors without requiring negative answers', () => {
      expect(
        resolveCreateSetupVisibleSetIds({
          sets: sequence([
            { id: 'form', isComplete: false, required: false },
            { id: 'facility', isComplete: false, required: false },
            { id: 'operator', isComplete: false },
          ]),
          activeSetId: 'operator',
        }),
      ).toEqual(['form', 'facility', 'operator'])
    })

    it('shows completed predecessors plus terminal when all complete', () => {
      expect(
        resolveCreateSetupVisibleSetIds({
          sets: sequence([
            { id: 'a', isComplete: true },
            { id: 'b', isComplete: true },
            { id: 'c', isComplete: true },
          ]),
          activeSetId: 'c',
        }),
      ).toEqual(['a', 'b', 'c'])
    })

    it('when reopening an earlier set, hides later incomplete unlock and keeps completed predecessors', () => {
      expect(
        resolveCreateSetupVisibleSetIds({
          sets: sequence([
            { id: 'a', isComplete: true },
            { id: 'b', isComplete: true },
            { id: 'c', isComplete: true },
          ]),
          activeSetId: 'a',
        }),
      ).toEqual(['a'])
    })
  })

  describe('resolveCreateSetupCanContinue', () => {
    it('is false until every required set is complete', () => {
      expect(
        resolveCreateSetupCanContinue({
          sets: sequence([
            { id: 'a', isComplete: true },
            { id: 'b', isComplete: false },
          ]),
        }),
      ).toBe(false)
    })

    it('is true when all required sets are complete', () => {
      expect(
        resolveCreateSetupCanContinue({
          sets: sequence([
            { id: 'a', isComplete: true },
            { id: 'b', isComplete: true },
          ]),
        }),
      ).toBe(true)
    })

    it('treats a complete number set with collapseWhenComplete false as satisfying continue', () => {
      expect(
        resolveCreateSetupCanContinue({
          sets: sequence([
            { id: 'species', isComplete: true },
            { id: 'level', isComplete: true, collapseWhenComplete: false },
            { id: 'class', isComplete: true },
          ]),
        }),
      ).toBe(true)
    })

    it('ignores optional incomplete sets', () => {
      expect(
        resolveCreateSetupCanContinue({
          sets: sequence([
            { id: 'a', isComplete: true },
            { id: 'b', isComplete: false, required: false },
          ]),
        }),
      ).toBe(true)
    })

    it('is false for an empty sequence', () => {
      expect(resolveCreateSetupCanContinue({ sets: [] })).toBe(false)
    })
  })

  describe('isCreateSetupChoiceComplete', () => {
    it('treats non-empty values as complete', () => {
      expect(isCreateSetupChoiceComplete('city')).toBe(true)
      expect(isCreateSetupChoiceComplete('')).toBe(false)
      expect(isCreateSetupChoiceComplete(null)).toBe(false)
    })
  })

  describe('isCreateSetupNumberComplete', () => {
    it('requires an integer within bounds', () => {
      expect(isCreateSetupNumberComplete(1, 1, 20)).toBe(true)
      expect(isCreateSetupNumberComplete(0, 1, 20)).toBe(false)
      expect(isCreateSetupNumberComplete(21, 1, 20)).toBe(false)
    })
  })

  describe('resolveCreateSetupSetIdsToInvalidate', () => {
    it('clears direct dependents when an upstream id changes', () => {
      expect(
        resolveCreateSetupSetIdsToInvalidate({
          sets: [{ id: 'classification' }, { id: 'regionType', dependsOn: ['classification'] }],
          changedSetId: 'classification',
        }),
      ).toEqual(['regionType'])
    })

    it('clears transitive dependents', () => {
      expect(
        resolveCreateSetupSetIdsToInvalidate({
          sets: [{ id: 'a' }, { id: 'b', dependsOn: ['a'] }, { id: 'c', dependsOn: ['b'] }],
          changedSetId: 'a',
        }),
      ).toEqual(['b', 'c'])
    })

    it('returns an empty list when nothing depends on the changed id', () => {
      expect(
        resolveCreateSetupSetIdsToInvalidate({
          sets: [{ id: 'classification' }, { id: 'regionType', dependsOn: ['classification'] }],
          changedSetId: 'regionType',
        }),
      ).toEqual([])
    })
  })
})
