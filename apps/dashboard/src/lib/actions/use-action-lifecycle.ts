'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getBlockedActionTargets,
  getEligibleActionTargets,
  getErrorMessage,
  hasActionValidationBlockers,
  hasApplyOperationalFailures,
  mergeApplyBlockedOutcomesIntoValidation,
  partitionApplyOutcomes,
  type ActionApplyOutcome,
  type ActionTargetFailure,
  type ActionValidationResult,
} from '@rpg/contracts'

import type {
  ActionLifecycleCloseEvent,
  ActionLifecyclePhase,
  ActionResolutionRowModel,
  UseActionLifecycleOptions,
} from './action-lifecycle.types'

function createInitialConfirmedTargetIds(
  validation: ActionValidationResult<unknown> | null,
  fallbackTargetIds: readonly string[],
): Set<string> {
  if (!validation) {
    return new Set(fallbackTargetIds)
  }

  return new Set(getEligibleActionTargets(validation).map((target) => target.targetId))
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
  const [confirmedTargetIds, setConfirmedTargetIds] = useState<Set<string>>(() => new Set<string>())
  const [applyOutcomes, setApplyOutcomes] = useState<ActionApplyOutcome<TBlocker, TFailure>[]>([])
  const [localError, setLocalError] = useState<string | null>(null)
  const [pendingConfig, setPendingConfig] = useState<TConfig | null>(null)

  const resetLifecycle = useCallback(() => {
    setPhase('configure')
    setValidationResult(null)
    setConfirmedTargetIds(new Set())
    setApplyOutcomes([])
    setLocalError(null)
    setPendingConfig(null)
  }, [])

  useEffect(() => {
    if (!open) {
      resetLifecycle()
    }
  }, [open, resetLifecycle])

  const executeApply = useCallback(
    async (targetIds: readonly string[], config: TConfig) => {
      setPhase('submitting')
      setLocalError(null)

      try {
        const outcomes = await apply(targetIds, config)
        setApplyOutcomes(outcomes)

        const { blocked, failed, updated } = partitionApplyOutcomes(outcomes)

        if (blocked.length > 0) {
          const merged = mergeApplyBlockedOutcomesIntoValidation(
            validationResult ?? {
              targets: targets.map((target) => ({
                status: 'eligible' as const,
                targetId: target.targetId,
                targetName: target.targetName,
              })),
            },
            blocked,
          )
          setValidationResult(merged)
          setConfirmedTargetIds(createInitialConfirmedTargetIds(merged, targetIds))
          setPhase('resolve')
          return
        }

        if (failed.length > 0) {
          setPhase('result')
          return
        }

        onClose({
          reason: 'success',
          outcomes,
          fullSuccess: updated.length === targetIds.length,
        })
      } catch (error) {
        setLocalError(getErrorMessage(error, 'Could not complete the action.'))
        setPhase(requiresValidation ? 'resolve' : 'result')
      }
    },
    [apply, onClose, requiresValidation, targets],
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
          setValidationResult(result)
          setConfirmedTargetIds(createInitialConfirmedTargetIds(result, []))

          if (hasActionValidationBlockers(result)) {
            setPhase('resolve')
            return
          }

          const eligibleIds = getEligibleActionTargets(result).map((target) => target.targetId)
          await executeApply(eligibleIds, config)
        } catch (error) {
          const message =
            error instanceof Error && error.message.length > 0
              ? error.message
              : getErrorMessage(error, 'Could not validate the action.')
          setLocalError(message)
          setPhase('configure')
        }

        return
      }

      await executeApply(
        targets.map((target) => target.targetId),
        config,
      )
    },
    [executeApply, requiresValidation, targets, validate],
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

    await executeApply(targetIds, pendingConfig)
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

    await executeApply(failedIds, pendingConfig)
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
