import { describe, expect, it, vi } from 'vitest'

import {
  isCreateSetupChoiceComplete,
  notifyCreateSetupCompletionTransition,
  resolveCreateSetupActiveSetId,
  resolveCreateSetupIsComplete,
  resolveCreateSetupPendingExplicitDecisions,
  resolveCreateSetupSetExpanded,
  resolveCreateSetupSetIdsToInvalidate,
  resolveCreateSetupSetsComplete,
  resolveCreateSetupVisibleSetIds,
} from './create-setup-sequence.lib'
import { notifyCreateSetupValueChangeCompletion } from './use-create-setup-sequence.client'
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

    it('returns null when a single set is already complete', () => {
      expect(
        resolveCreateSetupActiveSetId({
          sets: sequence([{ id: 'siteType', isComplete: true }]),
        }),
      ).toBeNull()
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

    it('activates the first incomplete eligible-now set, including optionals', () => {
      expect(
        resolveCreateSetupActiveSetId({
          sets: sequence([
            { id: 'form', isComplete: false, required: false },
            { id: 'facility', isComplete: false, required: false },
            { id: 'operator', isComplete: false },
          ]),
        }),
      ).toBe('form')
    })

    it('does not activate sets whose reveal prerequisites are unsatisfied', () => {
      expect(
        resolveCreateSetupActiveSetId({
          sets: sequence([
            { id: 'form', isComplete: false, required: false },
            {
              id: 'facility',
              isComplete: false,
              visibleWhenComplete: ['form'],
            },
          ]),
        }),
      ).toBe('form')
    })

    it('returns null when all eligible sets are complete even if an external decision remains pending', () => {
      expect(
        resolveCreateSetupActiveSetId({
          sets: sequence([
            { id: 'membershipTitle', isComplete: true },
            { id: 'speciesId', isComplete: true, visibleWhenComplete: ['membershipTitle'] },
          ]),
        }),
      ).toBeNull()
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

    it('returns eligible complete sets when no question is active', () => {
      expect(
        resolveCreateSetupVisibleSetIds({
          sets: sequence([
            { id: 'membershipTitle', isComplete: true },
            { id: 'speciesId', isComplete: true, visibleWhenComplete: ['membershipTitle'] },
          ]),
          activeSetId: null,
        }),
      ).toEqual(['membershipTitle', 'speciesId'])
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

    it('keeps setup incomplete while an explicit external decision is pending', () => {
      const sets = sequence([
        { id: 'membershipTitle', isComplete: true },
        { id: 'speciesId', isComplete: true, visibleWhenComplete: ['membershipTitle'] },
      ])
      const externalDecisions = [
        {
          id: 'quickNpcBuild',
          isResolved: false,
          completion: 'explicit' as const,
          revision: 'v1',
        },
      ]

      expect(resolveCreateSetupActiveSetId({ sets })).toBeNull()
      expect(resolveCreateSetupVisibleSetIds({ sets, activeSetId: null })).toEqual([
        'membershipTitle',
        'speciesId',
      ])
      expect(resolveCreateSetupIsComplete({ sets, externalDecisions })).toBe(false)
      expect(
        resolveCreateSetupPendingExplicitDecisions({ externalDecisions }).map(
          (decision) => decision.id,
        ),
      ).toEqual(['quickNpcBuild'])
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

  describe('notifyCreateSetupValueChangeCompletion', () => {
    it('fires onSetupComplete whenever the next setup state is complete', () => {
      const onSetupComplete = vi.fn()
      const completeSet = {
        id: 'siteType',
        kind: 'choice' as const,
        fieldLabel: 'Site type',
        options: [{ value: 'city', label: 'City' }],
        value: 'city',
        isComplete: true,
      }

      notifyCreateSetupValueChangeCompletion({
        previousSets: [completeSet],
        nextSets: [completeSet],
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
