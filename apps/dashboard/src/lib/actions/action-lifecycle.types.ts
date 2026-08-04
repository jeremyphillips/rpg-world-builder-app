import type {
  ActionApplyOutcome,
  ActionTargetFailure,
  ActionTargetIdentity,
  ActionValidationResult,
} from '@rpg/contracts'

export type ActionLifecyclePhase = 'configure' | 'validating' | 'resolve' | 'submitting' | 'result'

export type ActionLifecycleCloseReason = 'cancel' | 'success' | 'accepted-mixed'

export type ActionLifecycleCloseEvent<TBlocker, TFailure extends ActionTargetFailure> = {
  reason: ActionLifecycleCloseReason
  outcomes: ActionApplyOutcome<TBlocker, TFailure>[]
  fullSuccess: boolean
}

export type ActionLifecycleValidateFn<TBlocker, TConfig> = (
  targets: readonly ActionTargetIdentity[],
  config: TConfig,
) => Promise<ActionValidationResult<TBlocker>>

export type ActionLifecycleApplyFn<TBlocker, TFailure extends ActionTargetFailure, TConfig> = (
  targetIds: readonly string[],
  config: TConfig,
) => Promise<ActionApplyOutcome<TBlocker, TFailure>[]>

export type UseActionLifecycleOptions<TBlocker, TFailure extends ActionTargetFailure, TConfig> = {
  open: boolean
  targets: readonly ActionTargetIdentity[]
  requiresValidation?: boolean
  validate?: ActionLifecycleValidateFn<TBlocker, TConfig>
  apply: ActionLifecycleApplyFn<TBlocker, TFailure, TConfig>
  onClose: (event: ActionLifecycleCloseEvent<TBlocker, TFailure>) => void
}

export type ActionResolutionRowState = 'eligible' | 'blocked' | 'updated' | 'failed'

export type ActionResolutionRowModel<TBlocker, TFailure extends ActionTargetFailure> = {
  targetId: string
  targetName: string
  state: ActionResolutionRowState
  checked: boolean
  disabled: boolean
  blockers?: TBlocker[]
  failure?: TFailure
}
