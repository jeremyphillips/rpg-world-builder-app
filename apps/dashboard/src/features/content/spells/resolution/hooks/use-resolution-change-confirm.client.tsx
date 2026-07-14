'use client'

import * as React from 'react'
import type { Control } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'

import {
  buildIncompatibleSelectionClearPatch,
  outcomeApplicationsReferenceEffect,
  planResolutionChange,
  resolutionChangeRequiresConfirm,
  type ResolutionChangePlan,
  type ResolutionChangeRequest,
  type ResolutionOutcomeRef,
} from '@rpg/contracts'

import { createDefaultProjectilesFormFields } from '../lib/application-pattern/resolution-application-pattern.lib'
import type {
  ResolutionFormValues,
  ResolutionOutcomeFormItem,
} from '../lib/form/resolution-form-schema'
import {
  hydrateOutcomeFormSlots,
  resolutionMethodFromForm,
} from '../lib/form/resolution-outcome-slots.lib'
import { RESOLUTION_FIELD_NAME } from '../lib/form/resolution-form-values'
import { resolutionFormToSelectionContext } from '../lib/selection/resolution-selection-context.lib'

export type ResolutionChangeNotice = {
  id: string
  message: string
}

type PendingResolutionChange = {
  change: ResolutionChangeRequest
}

function createNoticeId(): string {
  return crypto.randomUUID()
}

function enrichAppliedPatch(
  resolution: ResolutionFormValues,
  change: ResolutionChangeRequest,
  patch: Partial<ResolutionFormValues>,
): Partial<ResolutionFormValues> {
  if (
    change.field === 'applicationPatternKind' &&
    change.value === 'projectiles' &&
    resolution.applicationPatternKind !== 'projectiles' &&
    resolution.projectileCount === undefined
  ) {
    return { ...patch, ...createDefaultProjectilesFormFields() }
  }
  return patch
}

function toResolutionFormPatch(
  patch: Partial<ResolutionFormValues> & Record<string, unknown>,
): Partial<ResolutionFormValues> {
  return patch as Partial<ResolutionFormValues>
}

function mergeResolutionPatch(
  resolution: ResolutionFormValues,
  change: ResolutionChangeRequest,
  ...patches: Record<string, unknown>[]
): Partial<ResolutionFormValues> {
  return toResolutionFormPatch(
    enrichAppliedPatch(resolution, change, Object.assign({}, ...patches)),
  )
}

function mapOutcomeRefsToForm(
  outcomes: readonly ResolutionOutcomeRef[],
): ResolutionOutcomeFormItem[] {
  return outcomes.map((outcome) => ({
    result: outcome.result,
    ...(outcome.note ? { note: outcome.note } : {}),
    applications: outcome.applications.map((application) => ({
      effectId: application.effectId,
      amount: application.amount as ResolutionOutcomeFormItem['applications'][number]['amount'],
    })),
  }))
}

function applyOutcomePlanPatch(
  resolution: ResolutionFormValues,
  plan: ResolutionChangePlan,
): Partial<ResolutionFormValues> {
  if (!plan.outcomePatch) return {}

  const method = resolutionMethodFromForm({
    ...resolution,
    ...plan.requestedPatch,
    ...plan.cleanupPatch,
  } as ResolutionFormValues)
  const mapped = mapOutcomeRefsToForm(plan.outcomePatch.outcomes)
  if (!method) {
    return { outcomes: mapped }
  }

  return {
    outcomes: hydrateOutcomeFormSlots(method, mapped),
  }
}

function removeEffectPatch(
  resolution: ResolutionFormValues,
  effectId: string,
): Partial<ResolutionFormValues> {
  return {
    effects: resolution.effects.filter((effect) => effect.id !== effectId),
  }
}

type ResolutionChangeListener = () => void

type ResolutionChangeSnapshot = {
  pending: PendingResolutionChange | null
  notice: ResolutionChangeNotice | null
}

export type ResolutionChangeController = {
  subscribe: (listener: ResolutionChangeListener) => () => void
  getSnapshot: () => ResolutionChangeSnapshot
  requestResolutionChange: (change: ResolutionChangeRequest) => void
  confirmPendingChange: () => void
  cancelPendingChange: () => void
  clearNotice: () => void
}

const controllers = new WeakMap<Control, ResolutionChangeController>()

function createController(
  getValues: (name: typeof RESOLUTION_FIELD_NAME) => ResolutionFormValues | undefined,
  setValue: (
    name: typeof RESOLUTION_FIELD_NAME,
    value: ResolutionFormValues,
    options: { shouldDirty: boolean; shouldValidate: boolean },
  ) => void,
): ResolutionChangeController {
  let pending: PendingResolutionChange | null = null
  let notice: ResolutionChangeNotice | null = null
  let snapshot: ResolutionChangeSnapshot = { pending: null, notice: null }
  const listeners = new Set<ResolutionChangeListener>()

  const syncSnapshot = () => {
    snapshot = { pending, notice }
  }

  const notify = () => {
    syncSnapshot()
    listeners.forEach((listener) => listener())
  }

  const applyPatch = (patch: Partial<ResolutionFormValues>) => {
    const current = getValues(RESOLUTION_FIELD_NAME)
    if (!current) return
    setValue(
      RESOLUTION_FIELD_NAME,
      { ...current, ...patch },
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    )
  }

  return {
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot() {
      return snapshot
    },
    requestResolutionChange(change) {
      const resolution = getValues(RESOLUTION_FIELD_NAME)
      const before = resolutionFormToSelectionContext(resolution)
      if (!before || !resolution) return

      if (change.field === 'removeEffect') {
        const effect = resolution.effects.find((entry) => entry.id === change.effectId)
        if (!effect) return

        if (!outcomeApplicationsReferenceEffect(resolution.outcomes, change.effectId)) {
          applyPatch(removeEffectPatch(resolution, change.effectId))
          return
        }
      }

      const plan = planResolutionChange(before, change)
      if (!resolutionChangeRequiresConfirm(plan)) {
        applyPatch(
          mergeResolutionPatch(resolution, change, {
            ...plan.requestedPatch,
            ...plan.cleanupPatch,
            ...applyOutcomePlanPatch(
              {
                ...resolution,
                ...plan.requestedPatch,
                ...plan.cleanupPatch,
              } as ResolutionFormValues,
              plan,
            ),
            ...(change.field === 'removeEffect'
              ? removeEffectPatch(resolution, change.effectId)
              : {}),
          }),
        )
        return
      }

      pending = { change }
      notify()
    },
    confirmPendingChange() {
      if (!pending) return

      const resolution = getValues(RESOLUTION_FIELD_NAME)
      const before = resolutionFormToSelectionContext(resolution)
      if (!before || !resolution) {
        pending = null
        notify()
        return
      }

      const plan = planResolutionChange(before, pending.change)
      const pendingChange = pending.change
      const incompatibleClear = buildIncompatibleSelectionClearPatch(plan.incompatibleSelections)
      const mergedResolution = {
        ...resolution,
        ...plan.requestedPatch,
        ...plan.cleanupPatch,
        ...incompatibleClear,
      } as ResolutionFormValues
      const nextEffects =
        plan.effectsToRemove.length > 0 || pendingChange.field === 'removeEffect'
          ? mergedResolution.effects.filter(
              (effect) =>
                !plan.effectsToRemove.some((removed) => removed.id === effect.id) &&
                !(pendingChange.field === 'removeEffect' && effect.id === pendingChange.effectId),
            )
          : mergedResolution.effects

      applyPatch(
        mergeResolutionPatch(resolution, pending.change, {
          ...plan.requestedPatch,
          ...plan.cleanupPatch,
          ...incompatibleClear,
          ...applyOutcomePlanPatch(mergedResolution, plan),
          effects: nextEffects,
        }),
      )

      if (plan.incompatibleSelections.length > 0 || plan.effectsToRemove.length > 0) {
        notice = {
          id: createNoticeId(),
          message: 'Resolution selections were updated. Review method, pattern, and effects.',
        }
      }

      pending = null
      notify()
    },
    cancelPendingChange() {
      pending = null
      notify()
    },
    clearNotice() {
      notice = null
      notify()
    },
  }
}

export function useResolutionChangeController(): ResolutionChangeController {
  const form = useFormContext()
  const formRef = React.useRef(form)
  formRef.current = form

  return React.useMemo(() => {
    const existing = controllers.get(form.control)
    if (existing) return existing

    const controller = createController(
      (name) => formRef.current.getValues(name) as ResolutionFormValues | undefined,
      (name, value, options) => formRef.current.setValue(name, value, options),
    )
    controllers.set(form.control, controller)
    return controller
  }, [form.control])
}

export function useResolutionChangeSnapshot() {
  const controller = useResolutionChangeController()
  return React.useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  )
}

export function useResolutionEditorContext() {
  const controller = useResolutionChangeController()
  const { notice } = useResolutionChangeSnapshot()

  return React.useMemo(
    () => ({
      requestResolutionChange: controller.requestResolutionChange,
      notice,
      clearNotice: controller.clearNotice,
    }),
    [controller, notice],
  )
}
