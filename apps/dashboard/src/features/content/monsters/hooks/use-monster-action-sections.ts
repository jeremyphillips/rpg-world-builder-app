import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { useMasterDetailArray } from '../../lib/master-detail/use-master-detail-array'
import {
  actionAfterSectionMove,
  actionMoveDropsTrigger,
  describeActionKindSwitchLoss,
  reconcileMonsterActionKind,
} from '../lib/monster-action-kind'
import {
  createActionFromPreset,
  type MonsterActionDraftRow,
  type MonsterActionPresetId,
} from '../lib/monster-action-presets'
import {
  firstMonsterActionId,
  resolveFirstInvalidActionPath,
  resolveMonsterActionSelectionAfterRemoval,
} from '../lib/monster-action-selection'
import {
  MONSTER_ACTION_SECTIONS,
  type MonsterActionSection,
} from '../lib/monster-equipment-references'
import type { MonsterFormValues } from '../lib/monster-form-values'
import type { MonsterActionKind } from '@rpg/contracts'

type KindSwitchPending = {
  type: 'kind'
  section: MonsterActionSection
  index: number
  nextKind: MonsterActionKind
  losses: string[]
}

type TriggerPending = {
  type: 'trigger'
  from: MonsterActionSection
  to: MonsterActionSection
  index: number
}

export type MonsterActionPending = KindSwitchPending | TriggerPending

function rowsOf(
  values: MonsterFormValues | undefined,
  section: MonsterActionSection,
): MonsterActionDraftRow[] {
  const rows = values?.[section]
  return Array.isArray(rows) ? (rows as MonsterActionDraftRow[]) : []
}

export function useMonsterActionSections(entityId?: string) {
  const { getValues, setValue, clearErrors, trigger, formState } =
    useFormContext<MonsterFormValues>()
  const watched = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const actions = useMasterDetailArray('actions', () => createActionFromPreset('weapon'))
  const bonusActions = useMasterDetailArray('bonusActions', () => createActionFromPreset('weapon'))
  const reactions = useMasterDetailArray('reactions', () => createActionFromPreset('weapon'))
  const editors = useMemo(
    () => ({ actions, bonusActions, reactions }),
    [actions, bonusActions, reactions],
  )
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)
  const [pending, setPending] = useState<MonsterActionPending | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [focusToken, setFocusToken] = useState(0)

  const idSignature = MONSTER_ACTION_SECTIONS.map((section) =>
    rowsOf(watched, section)
      .map((row) => row.id)
      .join(','),
  ).join('|')

  useEffect(() => {
    setSelectedActionId(firstMonsterActionId(getValues()))
    setNotice(null)
    setPending(null)
  }, [entityId, getValues])

  useEffect(() => {
    setSelectedActionId((current) => {
      if (
        current &&
        idSignature.split('|').some((section) => section.split(',').includes(current))
      ) {
        return current
      }
      return firstMonsterActionId(getValues())
    })
  }, [getValues, idSignature])

  useEffect(() => {
    if (formState.submitCount === 0) return
    const resolved = resolveFirstInvalidActionPath(formState.errors, getValues())
    if (resolved) setSelectedActionId(resolved.id)
  }, [formState.errors, formState.submitCount, getValues])

  const locate = useCallback(
    (actionId: string | null) => {
      if (!actionId) return null
      const values = getValues()
      for (const section of MONSTER_ACTION_SECTIONS) {
        const index = rowsOf(values, section).findIndex((row) => row.id === actionId)
        if (index >= 0) {
          return { section, index, action: rowsOf(values, section)[index]! }
        }
      }
      return null
    },
    [getValues],
  )

  const addPreset = useCallback(
    (section: MonsterActionSection, presetId: MonsterActionPresetId) => {
      const row = createActionFromPreset(presetId)
      editors[section].appendRow(row)
      setSelectedActionId(row.id)
      setNotice(null)
    },
    [editors],
  )

  const removeAction = useCallback(
    (actionId: string) => {
      const located = locate(actionId)
      if (!located) return
      const next = resolveMonsterActionSelectionAfterRemoval(getValues(), located.section, actionId)
      editors[located.section].removeAt(located.index)
      setSelectedActionId(next)
    },
    [editors, getValues, locate],
  )

  const reorder = useCallback(
    (section: MonsterActionSection, from: number, to: number) => {
      editors[section].move(from, to)
      setFocusToken((token) => token + 1)
    },
    [editors],
  )

  const commitMove = useCallback(
    (from: MonsterActionSection, index: number, to: MonsterActionSection) => {
      const values = getValues()
      const action = rowsOf(values, from)[index]
      if (!action) return
      const presented =
        editors[from].hasRowError(index) &&
        (formState.submitCount > 0 || formState.touchedFields[from]?.[index] != null)
      clearErrors(`${from}.${index}`)
      const nextRow = actionAfterSectionMove(action, to)
      const targetIndex = rowsOf(values, to).length
      editors[from].removeAt(index)
      editors[to].appendRow(nextRow)
      if (presented) void trigger(`${to}.${targetIndex}`)
      setSelectedActionId(action.id)
      setFocusToken((token) => token + 1)
      setPending(null)
    },
    [clearErrors, editors, formState.submitCount, formState.touchedFields, getValues, trigger],
  )

  const requestMove = useCallback(
    (to: MonsterActionSection) => {
      const located = locate(selectedActionId)
      if (!located || located.section === to) return
      if (actionMoveDropsTrigger(located.action, located.section, to)) {
        setPending({ type: 'trigger', from: located.section, to, index: located.index })
        return
      }
      commitMove(located.section, located.index, to)
    },
    [commitMove, locate, selectedActionId],
  )

  const applyKind = useCallback(
    (
      section: MonsterActionSection,
      index: number,
      nextKind: MonsterActionKind,
      resolvedWeaponName?: string,
    ) => {
      const action = rowsOf(getValues(), section)[index]
      if (!action) return
      const next = reconcileMonsterActionKind(action, nextKind, { resolvedWeaponName })
      setValue(`${section}.${index}`, next, { shouldDirty: true })
      clearErrors(`${section}.${index}`)
      setPending(null)
    },
    [clearErrors, getValues, setValue],
  )

  const requestKind = useCallback(
    (nextKind: MonsterActionKind, equipmentName?: string, resolvedWeaponName?: string) => {
      const located = locate(selectedActionId)
      if (!located || located.action.kind === nextKind) return
      const losses = describeActionKindSwitchLoss(located.action, nextKind, { equipmentName })
      if (losses.length === 0) {
        applyKind(located.section, located.index, nextKind, resolvedWeaponName)
        return
      }
      setPending({
        type: 'kind',
        section: located.section,
        index: located.index,
        nextKind,
        losses,
      })
    },
    [applyKind, locate, selectedActionId],
  )

  const confirmPending = useCallback(
    (resolvedWeaponName?: string) => {
      if (!pending) return
      if (pending.type === 'kind') {
        applyKind(pending.section, pending.index, pending.nextKind, resolvedWeaponName)
        return
      }
      commitMove(pending.from, pending.index, pending.to)
    },
    [applyKind, commitMove, pending],
  )

  const replaceAction = useCallback(
    (section: MonsterActionSection, index: number, next: MonsterActionDraftRow) => {
      setValue(`${section}.${index}`, next, { shouldDirty: true })
    },
    [setValue],
  )

  return {
    editors,
    selectedActionId,
    setSelectedActionId,
    pending,
    setPending,
    notice,
    setNotice,
    focusToken,
    addPreset,
    removeAction,
    reorder,
    requestMove,
    requestKind,
    confirmPending,
    replaceAction,
    locate,
    hasRowError: (section: MonsterActionSection, index: number) =>
      editors[section].hasRowError(index),
  }
}
