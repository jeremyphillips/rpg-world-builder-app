'use client'

import * as React from 'react'
import type { Control, UseFormReturn } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'

import { getArrayFieldMutators } from '@rpg/ui/form'

import {
  buildIncompatibleSelectionClearPatch,
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
import {
  initializeOriginFromSpellRange,
  RESOLUTION_FIELD_NAME,
} from '../lib/form/resolution-form-values'
import { readResolutionValues } from '../lib/form/resolution-change-form-read.lib'
import {
  resolutionFormToSelectionContext,
  selectionCleanupPatchToFormPatch,
} from '../lib/selection/resolution-selection-context.lib'

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

function readSpellRangeDistanceFt(getForm: () => ResolutionFormApi): number | undefined {
  const rootValues = getForm().getValues() as {
    range?: { kind?: string; value?: { value?: number } }
  }
  if (rootValues.range?.kind !== 'distance' || rootValues.range.value?.value === undefined) {
    return undefined
  }
  return initializeOriginFromSpellRange({
    range: {
      kind: 'distance',
      value: { value: rootValues.range.value.value, unit: 'ft' },
    },
  })
}

function enrichPointModeOrigin(
  getForm: () => ResolutionFormApi,
  patch: Partial<ResolutionFormValues>,
): Partial<ResolutionFormValues> {
  if (patch.originDistanceFt !== undefined) return patch
  const originDistanceFt = readSpellRangeDistanceFt(getForm)
  return originDistanceFt === undefined ? patch : { ...patch, originDistanceFt }
}

function enrichTargetsModeDefaults(
  resolution: ResolutionFormValues,
  patch: Partial<ResolutionFormValues>,
): Partial<ResolutionFormValues> {
  return {
    proximityKind: resolution.proximityKind ?? 'touch',
    targetCount: patch.targetCount ?? 1,
    countKind: patch.countKind ?? 'exact',
    targetKind: patch.targetKind ?? resolution.targetKind ?? 'creature-or-object',
    ...patch,
  }
}

function enrichSelectionModePatch(
  getForm: () => ResolutionFormApi,
  resolution: ResolutionFormValues,
  change: ResolutionChangeRequest,
  patch: Partial<ResolutionFormValues>,
): Partial<ResolutionFormValues> {
  if (change.field !== 'selectionMode') return patch

  if (change.value === 'point') {
    return enrichPointModeOrigin(getForm, patch)
  }
  if (change.value === 'targets') {
    return enrichTargetsModeDefaults(resolution, patch)
  }
  return patch
}

function enrichAppliedPatch(
  getForm: () => ResolutionFormApi,
  resolution: ResolutionFormValues,
  change: ResolutionChangeRequest,
  patch: Partial<ResolutionFormValues>,
): Partial<ResolutionFormValues> {
  const withSelectionMode = enrichSelectionModePatch(getForm, resolution, change, patch)

  if (
    change.field === 'applicationPatternKind' &&
    change.value === 'projectiles' &&
    resolution.applicationPatternKind !== 'projectiles' &&
    resolution.projectileCount === undefined
  ) {
    return { ...withSelectionMode, ...createDefaultProjectilesFormFields() }
  }
  return withSelectionMode
}

function toResolutionFormPatch(
  patch: Partial<ResolutionFormValues> & Record<string, unknown>,
): Partial<ResolutionFormValues> {
  return patch as Partial<ResolutionFormValues>
}

function mergeResolutionPatch(
  getForm: () => ResolutionFormApi,
  resolution: ResolutionFormValues,
  change: ResolutionChangeRequest,
  ...patches: Record<string, unknown>[]
): Partial<ResolutionFormValues> {
  return toResolutionFormPatch(
    enrichAppliedPatch(getForm, resolution, change, Object.assign({}, ...patches)),
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

type ResolutionFormApi = Pick<UseFormReturn, 'control' | 'getValues' | 'setValue'>

function applyEffectsPatch(
  getForm: () => ResolutionFormApi,
  nextEffects: ResolutionFormValues['effects'],
  patch: Partial<ResolutionFormValues>,
): boolean {
  const { control, getValues, setValue } = getForm()
  const mutators = getArrayFieldMutators(control, `${RESOLUTION_FIELD_NAME}.effects`)
  if (!mutators) return false

  const currentEffects = mutators.getValues() as ResolutionFormValues['effects']
  const removedIndexes = currentEffects
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !nextEffects.some((next) => next.id === item.id))
    .map(({ index }) => index)
    .sort((a, b) => b - a)

  removedIndexes.forEach((index) => mutators.remove(index))

  const setOptions = { shouldDirty: true, shouldValidate: true } as const
  const { effects: _effects, ...rest } = patch

  if (patch.outcomes) {
    setValue(`${RESOLUTION_FIELD_NAME}.outcomes`, patch.outcomes, setOptions)
  }

  if (Object.keys(rest).length > 0) {
    const current = readResolutionValues(getValues, control, undefined)
    if (current) {
      setValue(RESOLUTION_FIELD_NAME, { ...current, ...rest, effects: nextEffects }, setOptions)
    }
  }

  return true
}

function createController(
  getForm: () => ResolutionFormApi,
  defaultResolution?: ResolutionFormValues,
): ResolutionChangeController {
  let initialResolution: ResolutionFormValues | undefined = defaultResolution

  const resolveInitialResolution = (): ResolutionFormValues | undefined => {
    if (initialResolution) return initialResolution

    const { getValues, control } = getForm()
    initialResolution =
      readResolutionValues(getValues, control, defaultResolution) ??
      (getValues() as { resolution?: ResolutionFormValues }).resolution ??
      defaultResolution

    return initialResolution
  }
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
    const { getValues, setValue, control } = getForm()
    const current = readResolutionValues(getValues, control, resolveInitialResolution())
    if (!current) return

    const next: ResolutionFormValues = { ...current, ...patch }
    const setOptions = { shouldDirty: true, shouldValidate: true } as const

    if (patch.effects) {
      if (applyEffectsPatch(getForm, next.effects, patch)) {
        return
      }

      setValue(`${RESOLUTION_FIELD_NAME}.effects`, next.effects, setOptions)
    }

    if (patch.outcomes) {
      setValue(`${RESOLUTION_FIELD_NAME}.outcomes`, next.outcomes, setOptions)
    }

    setValue(RESOLUTION_FIELD_NAME, next, setOptions)
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
      const { getValues, control } = getForm()
      const resolution = readResolutionValues(getValues, control, resolveInitialResolution())
      const before = resolutionFormToSelectionContext(resolution)
      if (!before || !resolution) return

      const plan = planResolutionChange(before, change)
      if (!resolutionChangeRequiresConfirm(plan)) {
        applyPatch(
          mergeResolutionPatch(
            getForm,
            resolution,
            change,
            selectionCleanupPatchToFormPatch(plan.requestedPatch),
            selectionCleanupPatchToFormPatch(plan.cleanupPatch),
            applyOutcomePlanPatch(
              {
                ...resolution,
                ...selectionCleanupPatchToFormPatch(plan.requestedPatch),
                ...selectionCleanupPatchToFormPatch(plan.cleanupPatch),
              } as ResolutionFormValues,
              plan,
            ),
            ...(change.field === 'removeEffect'
              ? [removeEffectPatch(resolution, change.effectId)]
              : []),
          ),
        )
        return
      }

      pending = { change }
      notify()
    },
    confirmPendingChange() {
      if (!pending) return

      const { getValues, control } = getForm()
      const resolution = readResolutionValues(getValues, control, resolveInitialResolution())
      const before = resolutionFormToSelectionContext(resolution)
      if (!before || !resolution) {
        pending = null
        notify()
        return
      }

      const plan = planResolutionChange(before, pending.change)
      const pendingChange = pending.change
      const incompatibleClear = selectionCleanupPatchToFormPatch(
        buildIncompatibleSelectionClearPatch(plan.incompatibleSelections),
      )
      const mergedResolution = {
        ...resolution,
        ...selectionCleanupPatchToFormPatch(plan.requestedPatch),
        ...selectionCleanupPatchToFormPatch(plan.cleanupPatch),
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
        mergeResolutionPatch(getForm, resolution, pending.change, {
          ...selectionCleanupPatchToFormPatch(plan.requestedPatch),
          ...selectionCleanupPatchToFormPatch(plan.cleanupPatch),
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

    const defaultResolution = (
      formRef.current.formState.defaultValues as { resolution?: ResolutionFormValues }
    ).resolution

    const controller = createController(
      () => ({
        control: formRef.current.control,
        getValues: formRef.current.getValues.bind(formRef.current),
        setValue: formRef.current.setValue.bind(formRef.current),
      }),
      defaultResolution,
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
