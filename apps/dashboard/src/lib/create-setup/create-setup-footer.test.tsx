import { describe, expect, it } from 'vitest'

import { deriveCreateSetupFooterState } from './create-setup-footer.client'
import {
  resolveCreateSetupIsComplete,
  resolveCreateSetupPendingExplicitDecisions,
  resolveCreateSetupSetsComplete,
} from './create-setup-sequence.lib'
import type { CreateSetupExternalDecision, CreateSetupSequenceModel } from './create-setup.types'

function buildModel(overrides: Partial<CreateSetupSequenceModel> = {}): CreateSetupSequenceModel {
  return {
    activeSetId: null,
    visibleSetIds: [],
    reopenSetId: null,
    reopen: () => undefined,
    takeEditSessionDismiss: () => undefined,
    isEditingUpstream: false,
    isComplete: false,
    pendingExplicitDecisions: [],
    completeExplicitDecision: () => undefined,
    ...overrides,
  }
}

describe('CreateSetupFooter', () => {
  describe('deriveCreateSetupFooterState', () => {
    it('shows cancel-only while an auto-completing sequence is in progress', () => {
      expect(deriveCreateSetupFooterState(buildModel())).toBe('cancel-only')
    })

    it('shows disabled Continue while an explicit decision is unresolved', () => {
      expect(
        deriveCreateSetupFooterState(
          buildModel({
            pendingExplicitDecisions: [
              { id: 'build', isResolved: false, completeLabel: 'Continue' },
            ],
          }),
        ),
      ).toBe('continue-disabled')
    })

    it('shows enabled Continue while an explicit decision is resolved but unconfirmed', () => {
      expect(
        deriveCreateSetupFooterState(
          buildModel({
            pendingExplicitDecisions: [
              { id: 'build', isResolved: true, completeLabel: 'Continue' },
            ],
          }),
        ),
      ).toBe('continue-enabled')
    })

    it('shows re-entry Continue when setup is already complete', () => {
      expect(
        deriveCreateSetupFooterState(
          buildModel({
            isComplete: true,
          }),
        ),
      ).toBe('re-entry-continue')
    })
  })
})

describe('create-setup completion', () => {
  it('requires every set to be complete', () => {
    expect(
      resolveCreateSetupSetsComplete({
        sets: [
          { id: 'a', isComplete: true },
          { id: 'b', isComplete: false },
        ],
      }),
    ).toBe(false)
  })

  it('requires explicit external decisions to be confirmed at the current revision', () => {
    const externalDecisions: CreateSetupExternalDecision[] = [
      {
        id: 'build',
        isResolved: true,
        completion: 'explicit',
        revision: 'v2',
        completeLabel: 'Continue',
      },
    ]

    expect(
      resolveCreateSetupIsComplete({
        sets: [{ id: 'title', isComplete: true }],
        externalDecisions,
        confirmedRevisionById: new Map([['build', 'v1']]),
      }),
    ).toBe(false)

    expect(
      resolveCreateSetupIsComplete({
        sets: [{ id: 'title', isComplete: true }],
        externalDecisions,
        confirmedRevisionById: new Map([['build', 'v2']]),
      }),
    ).toBe(true)
  })

  it('lists unresolved explicit decisions as pending', () => {
    expect(
      resolveCreateSetupPendingExplicitDecisions({
        externalDecisions: [
          {
            id: 'build',
            isResolved: false,
            completion: 'explicit',
            revision: 'v1',
            completeLabel: 'Continue',
          },
        ],
      }),
    ).toEqual([{ id: 'build', isResolved: false, completeLabel: 'Continue' }])
  })
})
