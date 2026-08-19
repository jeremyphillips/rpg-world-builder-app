import { describe, expect, it, vi } from 'vitest'

import {
  isCreateSetupChoiceComplete,
  notifyCreateSetupCompletionTransition,
  resolveCreateSetupActiveSetId,
  resolveCreateSetupIsComplete,
  resolveCreateSetupSetExpanded,
  resolveCreateSetupSetIdsToInvalidate,
  resolveCreateSetupSetsComplete,
  resolveCreateSetupVisibleSetIds,
} from './create-setup-sequence.lib'
import type { CreateSetupSequenceItem } from './create-setup.types'

function sequence(
  items: Array<{
    id: string
    isComplete: boolean
    required?: boolean
    visibleWhenComplete?: readonly string[]
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
  })

  describe('resolveCreateSetupSetExpanded', () => {
    it('expands only the active set', () => {
      expect(
        resolveCreateSetupSetExpanded({
          setId: 'classification',
          activeSetId: 'classification',
        }),
      ).toBe(true)
      expect(
        resolveCreateSetupSetExpanded({
          setId: 'regionType',
          activeSetId: 'classification',
        }),
      ).toBe(false)
    })

    it('re-expands a completed set when it is explicitly reopened', () => {
      expect(
        resolveCreateSetupSetExpanded({
          setId: 'class',
          activeSetId: 'class',
          reopenSetId: 'class',
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
          ]),
          activeSetId: 'a',
        }),
      ).toEqual(['a'])
    })

    it('reveals completed predecessors plus the active set', () => {
      expect(
        resolveCreateSetupVisibleSetIds({
          sets: sequence([
            { id: 'a', isComplete: true },
            { id: 'b', isComplete: false },
          ]),
          activeSetId: 'b',
        }),
      ).toEqual(['a', 'b'])
    })
  })

  describe('resolveCreateSetupSetsComplete', () => {
    it('requires every set in the sequence to be complete', () => {
      expect(
        resolveCreateSetupSetsComplete({
          sets: sequence([
            { id: 'a', isComplete: true },
            { id: 'b', isComplete: false },
          ]),
        }),
      ).toBe(false)

      expect(
        resolveCreateSetupSetsComplete({
          sets: sequence([
            { id: 'a', isComplete: true },
            { id: 'b', isComplete: true },
          ]),
        }),
      ).toBe(true)
    })
  })

  describe('resolveCreateSetupIsComplete', () => {
    it('requires explicit external decisions to be confirmed', () => {
      expect(
        resolveCreateSetupIsComplete({
          sets: sequence([{ id: 'title', isComplete: true }]),
          externalDecisions: [
            {
              id: 'build',
              isResolved: true,
              completion: 'explicit',
              revision: 'v1',
            },
          ],
        }),
      ).toBe(false)

      expect(
        resolveCreateSetupIsComplete({
          sets: sequence([{ id: 'title', isComplete: true }]),
          externalDecisions: [
            {
              id: 'build',
              isResolved: true,
              completion: 'explicit',
              revision: 'v1',
            },
          ],
          confirmedRevisionById: new Map([['build', 'v1']]),
        }),
      ).toBe(true)
    })
  })

  describe('notifyCreateSetupCompletionTransition', () => {
    it('fires onSetupComplete only on a false to true transition', () => {
      const onSetupComplete = vi.fn()

      notifyCreateSetupCompletionTransition({
        wasComplete: false,
        nextComplete: true,
        onSetupComplete,
      })
      notifyCreateSetupCompletionTransition({
        wasComplete: true,
        nextComplete: true,
        onSetupComplete,
      })

      expect(onSetupComplete).toHaveBeenCalledTimes(1)
    })
  })

  describe('isCreateSetupChoiceComplete', () => {
    it('treats non-empty values as complete', () => {
      expect(isCreateSetupChoiceComplete('city')).toBe(true)
      expect(isCreateSetupChoiceComplete('')).toBe(false)
      expect(isCreateSetupChoiceComplete(null)).toBe(false)
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
  })
})
