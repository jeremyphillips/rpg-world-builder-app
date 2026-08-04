'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createEligibleActionTarget,
  getBlockedActionTargets,
  getEligibleActionTargets,
  getErrorMessage,
  hasActionValidationBlockers,
  hasApplyOperationalFailures,
  mergeApplyBlockedOutcomesIntoValidation,
  partitionApplyOutcomes,
  type ActionApplyOutcome,
  type ActionTargetFailure,
  type ActionTargetIdentity,
  type ActionValidationResult,
} from '@rpg/contracts'

import type {
  ActionLifecycleCloseEvent,
  ActionLifecyclePhase,
  ActionResolutionRowModel,
  UseActionLifecycleOptions,
} from './action-lifecycle.types'

const VALIDATION_SNAPSHOT_MISSING_ERROR = 'Internal error: validation snapshot missing.'

function resolveActionLifecycleErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message
  }

  return getErrorMessage(error, fallback)
}

function createInitialConfirmedTargetIds(
  validation: ActionValidationResult<unknown> | null,
  fallbackTargetIds: readonly string[],
): Set<string> {
  if (!validation) {
    return new Set(fallbackTargetIds)
  }

  return new Set(getEligibleActionTargets(validation).map((target) => target.targetId))
}

function buildSyntheticEligibleSnapshot<TBlocker>(
  targetIds: readonly string[],
  targets: readonly ActionTargetIdentity[],
): ActionValidationResult<TBlocker> {
  return {
    targets: targetIds.map((targetId) => {
      const target = targets.find((entry) => entry.targetId === targetId)
      return createEligibleActionTarget({
        targetId,
        targetName: target?.targetName ?? targetId,
      })
    }),
  }
}

export function useActionLifecycle<TBlocker, TFailure extends ActionTargetFailure, TConfig>({
  open,
  targets,
  requiresValidation = true,
  validate,
  apply,
  onClose,
}: UseActionLifecycleOptions<TBlocker, TFailure, TConfig>) {
  const [phase, setPhase] = useState<ActionLifecyclePhase>('configure')
  const [validationResult, setValidationResult] = useState<ActionValidationResult<TBlocker> | null>(
    null,
  )
  const validationResultRef = useRef<ActionValidationResult<TBlocker> | null>(null)
  const [confirmedTargetIds, setConfirmedTargetIds] = useState<Set<string>>(() => new Set<string>())
  const [applyOutcomes, setApplyOutcomes] = useState<ActionApplyOutcome<TBlocker, TFailure>[]>([])
  const [localError, setLocalError] = useState<string | null>(null)
  const [pendingConfig, setPendingConfig] = useState<TConfig | null>(null)

  const commitValidationResult = useCallback((result: ActionValidationResult<TBlocker> | null) => {
    validationResultRef.current = result
    setValidationResult(result)
  }, [])

  const resetLifecycle = useCallback(() => {
    setPhase('configure')
    commitValidationResult(null)
    setConfirmedTargetIds(new Set())
    setApplyOutcomes([])
    setLocalError(null)
    setPendingConfig(null)
  }, [commitValidationResult])

  useEffect(() => {
    if (!open) {
      resetLifecycle()
    }
  }, [open, resetLifecycle])

  const executeApply = useCallback(
    async (
      targetIds: readonly string[],
      config: TConfig,
      validationSnapshot?: ActionValidationResult<TBlocker> | null,
    ) => {
      setPhase('submitting')
      setLocalError(null)

      try {
        const outcomes = await apply(targetIds, config)
        setApplyOutcomes(outcomes)

        const { blocked, failed, updated } = partitionApplyOutcomes(outcomes)

        if (blocked.length > 0) {
          const snapshotForMerge = requiresValidation
            ? (validationSnapshot ?? validationResultRef.current)
            : buildSyntheticEligibleSnapshot<TBlocker>(targetIds, targets)

          if (requiresValidation && !snapshotForMerge) {
            setLocalError(VALIDATION_SNAPSHOT_MISSING_ERROR)
            setPhase('resolve')
            return
          }

          const merged = mergeApplyBlockedOutcomesIntoValidation(snapshotForMerge!, blocked)
          commitValidationResult(merged)
          setConfirmedTargetIds(createInitialConfirmedTargetIds(merged, targetIds))
          setPhase('resolve')
          return
        }

        if (failed.length > 0) {
          setPhase('result')
          return
        }

        try {
          onClose({
            reason: 'success',
            outcomes,
            fullSuccess: updated.length === targetIds.length,
          })
        } catch {
          // Apply succeeded; close side effects must not surface as apply failures.
        }
      } catch (error) {
        setLocalError(resolveActionLifecycleErrorMessage(error, 'Could not complete the action.'))
        setPhase(requiresValidation ? 'resolve' : 'result')
      }
    },
    [apply, commitValidationResult, onClose, requiresValidation, targets],
  )

  const startApply = useCallback(
    async (config: TConfig) => {
      setPendingConfig(config)
      setLocalError(null)

      if (requiresValidation) {
        if (!validate) {
          throw new Error('validate is required when requiresValidation is true.')
        }

        setPhase('validating')

        try {
          const result = await validate(targets, config)
          commitValidationResult(result)
          setConfirmedTargetIds(createInitialConfirmedTargetIds(result, []))

          if (hasActionValidationBlockers(result)) {
            setPhase('resolve')
            return
          }

          const eligibleIds = getEligibleActionTargets(result).map((target) => target.targetId)
          await executeApply(eligibleIds, config, result)
        } catch (error) {
          setLocalError(resolveActionLifecycleErrorMessage(error, 'Could not validate the action.'))
          setPhase('configure')
        }

        return
      }

      await executeApply(
        targets.map((target) => target.targetId),
        config,
      )
    },
    [commitValidationResult, executeApply, requiresValidation, targets, validate],
  )

  const confirmResolve = useCallback(async () => {
    if (!pendingConfig) {
      return
    }

    const targetIds = [...confirmedTargetIds]
    if (targetIds.length === 0) {
      setLocalError('Select at least one item to update.')
      return
    }

    await executeApply(targetIds, pendingConfig, validationResultRef.current)
  }, [confirmedTargetIds, executeApply, pendingConfig])

  const retryFailed = useCallback(async () => {
    if (!pendingConfig) {
      return
    }

    const failedIds = applyOutcomes
      .filter(
        (outcome): outcome is Extract<typeof outcome, { status: 'failed' }> =>
          outcome.status === 'failed',
      )
      .map((outcome) => outcome.targetId)

    if (failedIds.length === 0) {
      return
    }

    await executeApply(failedIds, pendingConfig, validationResultRef.current)
  }, [applyOutcomes, executeApply, pendingConfig])

  const goBackToConfigure = useCallback(() => {
    setPhase('configure')
    setLocalError(null)
  }, [])

  const cancel = useCallback(() => {
    onClose({
      reason: 'cancel',
      outcomes: applyOutcomes,
      fullSuccess: false,
    })
  }, [applyOutcomes, onClose])

  const acceptMixedResult = useCallback(() => {
    onClose({
      reason: 'accepted-mixed',
      outcomes: applyOutcomes,
      fullSuccess: false,
    })
  }, [applyOutcomes, onClose])

  const toggleConfirmedTarget = useCallback((targetId: string, checked: boolean) => {
    setConfirmedTargetIds((current) => {
      const next = new Set(current)
      if (checked) {
        next.add(targetId)
      } else {
        next.delete(targetId)
      }
      return next
    })
  }, [])

  const resolutionRows = useMemo((): ActionResolutionRowModel<TBlocker, TFailure>[] => {
    if (phase === 'result') {
      return applyOutcomes.map((outcome) => {
        const target = targets.find((entry) => entry.targetId === outcome.targetId)
        const targetName = target?.targetName ?? outcome.targetId

        if (outcome.status === 'updated') {
          return {
            targetId: outcome.targetId,
            targetName,
            state: 'updated',
            checked: false,
            disabled: true,
          }
        }

        if (outcome.status === 'failed') {
          return {
            targetId: outcome.targetId,
            targetName,
            state: 'failed',
            checked: false,
            disabled: true,
            failure: outcome.failure,
          }
        }

        if (outcome.status === 'blocked') {
          return {
            targetId: outcome.targetId,
            targetName,
            state: 'blocked',
            checked: false,
            disabled: true,
            blockers: outcome.blockers,
          }
        }

        return {
          targetId: outcome.targetId,
          targetName,
          state: 'eligible',
          checked: false,
          disabled: true,
        }
      })
    }

    if (!validationResult) {
      return []
    }

    return validationResult.targets.map((target) => {
      if (target.status === 'blocked') {
        return {
          targetId: target.targetId,
          targetName: target.targetName,
          state: 'blocked',
          checked: false,
          disabled: true,
          blockers: target.blockers,
        }
      }

      return {
        targetId: target.targetId,
        targetName: target.targetName,
        state: 'eligible',
        checked: confirmedTargetIds.has(target.targetId),
        disabled: false,
      }
    })
  }, [applyOutcomes, confirmedTargetIds, phase, targets, validationResult])

  const blockedCount = validationResult ? getBlockedActionTargets(validationResult).length : 0
  const confirmedCount = confirmedTargetIds.size

  return {
    phase,
    pending: phase === 'validating' || phase === 'submitting',
    localError,
    validationResult,
    applyOutcomes,
    confirmedTargetIds,
    confirmedCount,
    blockedCount,
    resolutionRows,
    hasOperationalFailures: hasApplyOperationalFailures(applyOutcomes),
    startApply,
    confirmResolve,
    retryFailed,
    goBackToConfigure,
    cancel,
    acceptMixedResult,
    toggleConfirmedTarget,
  }
}

export type UseActionLifecycleReturn<TBlocker, TFailure extends ActionTargetFailure> = ReturnType<
  typeof useActionLifecycle<TBlocker, TFailure, unknown>
>

export type { ActionLifecycleCloseEvent, ActionLifecyclePhase }
