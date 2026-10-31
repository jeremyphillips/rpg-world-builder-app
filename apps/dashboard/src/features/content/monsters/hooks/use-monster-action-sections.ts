import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { useMasterDetailArray } from '../../lib/master-detail/use-master-detail-array'
import {
  createEquippedWeaponAcquisition,
  createMonsterActionFromAcquisition,
  type MonsterActionAcquisitionChoice,
} from '../lib/actions/monster-action-acquisition'
import { actionAfterSectionMove, actionMoveDropsTrigger } from '../lib/actions/monster-action-kind'
import {
  multiattacksReferencingAction,
  stripMultiattackActionId,
} from '../lib/actions/monster-action-multiattack-references'
import type { MonsterActionDraftRow } from '../lib/actions/monster-action-presets'
import {
  firstMonsterActionId,
  resolveFirstInvalidActionPath,
  resolveMonsterActionSelectionAfterRemoval,
} from '../lib/actions/monster-action-selection'
import {
  MONSTER_ACTION_SECTIONS,
  type MonsterActionSection,
} from '../lib/actions/monster-action-equipment-references'
import { formatAddedEquipmentNotice } from '../lib/monster-form-labels'
import type { MonsterFormValues } from '../lib/monster-form-values'

type TriggerPending = {
  type: 'trigger'
  from: MonsterActionSection
  to: MonsterActionSection
  index: number
}

type MultiattackPending = {
  type: 'multiattack-delete' | 'multiattack-move'
  actionId: string
  names: string[]
  from: MonsterActionSection
  to?: MonsterActionSection
  index: number
}

export type MonsterActionPending = TriggerPending | MultiattackPending

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

type MissingPathEntry = { path: string; value: unknown }

function collectMissingPaths(
  snapshot: unknown,
  live: unknown,
  path: string,
  missing: MissingPathEntry[],
) {
  if (Array.isArray(snapshot)) {
    collectMissingArraySnapshot(snapshot, live, path, missing)
    return
  }
  if (isPlainRecord(snapshot)) {
    collectMissingRecordSnapshot(snapshot, live, path, missing)
  }
}

function collectMissingArraySnapshot(
  snapshot: unknown[],
  live: unknown,
  path: string,
  missing: MissingPathEntry[],
) {
  if (!Array.isArray(live)) {
    missing.push({ path, value: snapshot })
    return
  }
  live.forEach((item, index) => {
    const source = sourceForLiveItem(snapshot, item)
    if (source === undefined || !isPlainRecord(item) || typeof item.id !== 'string') return
    collectMissingPaths(source, item, `${path}.${index}`, missing)
  })
}

function collectMissingRecordSnapshot(
  snapshot: Record<string, unknown>,
  live: unknown,
  path: string,
  missing: MissingPathEntry[],
) {
  const liveRecord = isPlainRecord(live) ? live : {}
  for (const [key, value] of Object.entries(snapshot)) {
    const childPath = path ? `${path}.${key}` : key
    const liveValue = liveRecord[key]
    if (isPlainRecord(value) || Array.isArray(value)) {
      if (liveValue === undefined) {
        missing.push({ path: childPath, value })
        continue
      }
      collectMissingPaths(value, liveValue, childPath, missing)
      continue
    }
    if (liveValue === undefined && value !== undefined) {
      missing.push({ path: childPath, value })
    }
  }
}

function sourceForLiveItem(snapshot: unknown[], live: unknown): unknown {
  if (!isPlainRecord(live) || typeof live.id !== 'string') return undefined
  return snapshot.find((item) => isPlainRecord(item) && item.id === live.id)
}

function lostDefinedKeys(previous: unknown, next: unknown): boolean {
  if (Array.isArray(previous)) {
    if (!Array.isArray(next) || next.length < previous.length) return true
    return previous.some((item, index) => lostDefinedKeys(item, next[index]))
  }
  if (isPlainRecord(previous)) {
    if (!isPlainRecord(next)) return true
    return Object.entries(previous).some(([key, value]) => {
      if (value === undefined) return false
      if (next[key] === undefined) return true
      return lostDefinedKeys(value, next[key])
    })
  }
  return false
}

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
  const rowSnapshot = useRef<MonsterFormValues | undefined>(undefined)
  useLayoutEffect(() => {
    const live = getValues()
    const previous = rowSnapshot.current
    if (!previous || !lostDefinedKeys(previous, live)) rowSnapshot.current = live
  })
  const actions = useMasterDetailArray('actions', () =>
    createMonsterActionFromAcquisition({ type: 'create', kind: 'special' }),
  )
  const bonusActions = useMasterDetailArray('bonusActions', () =>
    createMonsterActionFromAcquisition({ type: 'create', kind: 'special' }),
  )
  const reactions = useMasterDetailArray('reactions', () =>
    createMonsterActionFromAcquisition({ type: 'create', kind: 'special' }),
  )
  const editors = useMemo(
    () => ({ actions, bonusActions, reactions }),
    [actions, bonusActions, reactions],
  )
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)
  const [pending, setPending] = useState<MonsterActionPending | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [focusToken, setFocusToken] = useState(0)

  useEffect(() => {
    const snapshot = rowSnapshot.current
    if (!snapshot) return
    const live = getValues()
    const missing: { path: string; value: unknown }[] = []
    for (const section of MONSTER_ACTION_SECTIONS) {
      collectMissingPaths(snapshot[section], live[section], section, missing)
    }
    for (const entry of missing) {
      setValue(entry.path as never, entry.value as never, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      })
    }
  })

  const idSignature = MONSTER_ACTION_SECTIONS.map((section) =>
    rowsOf(watched, section)
      .map((row) => row.id)
      .join(','),
  ).join('|')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset action editor state when switching monsters.
    setSelectedActionId(firstMonsterActionId(getValues()))
    setNotice(null)
    setPending(null)
  }, [entityId, getValues])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keep selection aligned with action row ids after list edits.
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- focus first invalid action after failed submit.
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

  const addAcquisition = useCallback(
    (
      section: MonsterActionSection,
      choice: Exclude<MonsterActionAcquisitionChoice, { type: 'add-weapon' }>,
    ) => {
      const row = createMonsterActionFromAcquisition(choice)
      editors[section].appendRow(row)
      setSelectedActionId(row.id)
      setNotice(null)
    },
    [editors],
  )

  const commitEquippedWeapon = useCallback(
    (section: MonsterActionSection, equipmentId: string, name: string) => {
      const { entry, action } = createEquippedWeaponAcquisition(equipmentId)
      const equipment = [...(getValues('equipment') ?? []), entry]
      setValue('equipment', equipment, { shouldDirty: true })
      editors[section].appendRow(action)
      setSelectedActionId(action.id)
      setNotice(formatAddedEquipmentNotice(name))
    },
    [editors, getValues, setValue],
  )

  const commitRemove = useCallback(
    (actionId: string) => {
      const located = locate(actionId)
      if (!located) return
      const nextSelection = resolveMonsterActionSelectionAfterRemoval(
        getValues(),
        located.section,
        actionId,
      )
      if (located.section === 'actions') {
        const actions = stripMultiattackActionId(rowsOf(getValues(), 'actions'), actionId).filter(
          (action) => action.id !== actionId,
        )
        setValue('actions', actions, { shouldDirty: true })
      } else {
        editors[located.section].removeAt(located.index)
      }
      setSelectedActionId(nextSelection)
      setPending(null)
    },
    [editors, getValues, locate, setValue],
  )

  const removeAction = useCallback(
    (actionId: string) => {
      const located = locate(actionId)
      if (!located) return
      const references =
        located.section === 'actions'
          ? multiattacksReferencingAction(rowsOf(getValues(), 'actions'), actionId)
          : []
      if (references.length > 0) {
        setPending({
          type: 'multiattack-delete',
          actionId,
          names: references.map((action) => action.name?.trim() || 'Multiattack'),
          from: located.section,
          index: located.index,
        })
        return
      }
      commitRemove(actionId)
    },
    [commitRemove, getValues, locate],
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
      if (located.action.kind === 'multiattack' && to !== 'actions') return
      if (
        located.section === 'actions' &&
        to !== 'actions' &&
        multiattacksReferencingAction(rowsOf(getValues(), 'actions'), located.action.id).length > 0
      ) {
        const references = multiattacksReferencingAction(
          rowsOf(getValues(), 'actions'),
          located.action.id,
        )
        setPending({
          type: 'multiattack-move',
          actionId: located.action.id,
          names: references.map((action) => action.name?.trim() || 'Multiattack'),
          from: located.section,
          to,
          index: located.index,
        })
        return
      }
      if (actionMoveDropsTrigger(located.action, located.section, to)) {
        setPending({ type: 'trigger', from: located.section, to, index: located.index })
        return
      }
      commitMove(located.section, located.index, to)
    },
    [commitMove, getValues, locate, selectedActionId],
  )

  const confirmPending = useCallback(() => {
    if (!pending) return
    if (pending.type === 'trigger' || pending.type === 'multiattack-move') {
      if (!pending.to) return
      commitMove(pending.from, pending.index, pending.to)
      return
    }
    commitRemove(pending.actionId)
  }, [commitMove, commitRemove, pending])

  return {
    values: watched,
    editors,
    selectedActionId,
    setSelectedActionId,
    pending,
    setPending,
    notice,
    setNotice,
    focusToken,
    addAcquisition,
    commitEquippedWeapon,
    removeAction,
    requestMove,
    confirmPending,
    locate,
    hasRowError: (section: MonsterActionSection, index: number) =>
      editors[section].hasRowError(index),
  }
}
