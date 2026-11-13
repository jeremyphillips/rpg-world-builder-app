import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { resolveMonsterActionIdentity } from '@rpg/contracts'
import { useFormContext, useWatch } from 'react-hook-form'

import { masterDetailItemTitle } from '../../lib/master-detail/master-detail-constants'
import { duplicateMasterDetailRow } from '../../lib/master-detail/duplicate-master-detail-row'
import { MONSTER_ACTION_ITEM_NOUN } from '../lib/monster-form-labels'
import { useMasterDetailArray } from '../../lib/master-detail/use-master-detail-array'
import {
  createEquippedWeaponAcquisition,
  createMonsterActionFromAcquisition,
  createReactionActionDraft,
  createSpellActionDraft,
  type MonsterActionAcquisitionChoice,
} from '../lib/actions/monster-action-acquisition'
import { createLegendaryActionDraft } from '../lib/actions/monster-legendary-action-acquisition'
import { monsterCastingDependentLabels } from '../lib/actions/monster-action-casting-summary'
import {
  actionAfterSectionMove,
  actionMoveDropsTrigger,
  monsterActionSectionMoveAllowed,
} from '../lib/actions/monster-action-kind'
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
import {
  formatAddedEquipmentNotice,
  formatCastingSourceDeleteNotice,
} from '../lib/monster-form-labels'

function monsterActionReferenceTitle(action: MonsterActionDraftRow): string {
  const identity = resolveMonsterActionIdentity({
    action,
    equipmentCatalogStatus: 'pending',
  })
  return identity.displayName.trim() || masterDetailItemTitle(undefined, MONSTER_ACTION_ITEM_NOUN)
}
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

/** Registration can leave `{ damage: { dice: { count: undefined } } }`. That is not authored data. */
function hasDefinedLeaf(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasDefinedLeaf)
  if (isPlainRecord(value)) return Object.values(value).some(hasDefinedLeaf)
  return value !== undefined
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
    if (key === 'limitedUse') continue
    const childPath = path ? `${path}.${key}` : key
    const liveValue = liveRecord[key]
    if (isPlainRecord(value) || Array.isArray(value)) {
      if (liveValue === undefined) {
        if (hasDefinedLeaf(value)) missing.push({ path: childPath, value })
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
      // The recharge editor owns this key and may clear or replace it.
      if (key === 'limitedUse') return false
      if (!hasDefinedLeaf(value)) return false
      if (next[key] === undefined) return true
      return lostDefinedKeys(value, next[key])
    })
  }
  return false
}

function legendaryUsesUnset(value: unknown): boolean {
  return value === undefined || value === null || value === ''
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
  const legendaryActions = useMasterDetailArray('legendaryActions', () =>
    createMonsterActionFromAcquisition({ type: 'create', kind: 'special' }),
  )
  const editors = useMemo(
    () => ({ actions, bonusActions, reactions, legendaryActions }),
    [actions, bonusActions, reactions, legendaryActions],
  )
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
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

  const selectLocatedEditor = useCallback(
    (actionId: string | null) => {
      if (!actionId) return
      const values = getValues()
      for (const section of MONSTER_ACTION_SECTIONS) {
        const index = rowsOf(values, section).findIndex((row) => row.id === actionId)
        if (index >= 0) {
          editors[section].select(index)
          return
        }
      }
    },
    [editors, getValues],
  )

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
      const row =
        choice.type === 'legendary'
          ? createLegendaryActionDraft(choice.category, getValues())
          : choice.type === 'reaction'
            ? createReactionActionDraft(choice.category, getValues())
            : choice.type === 'create' && choice.kind === 'spell'
              ? createSpellActionDraft(section, getValues(), choice.spellAcquisition)
              : createMonsterActionFromAcquisition(choice)
      const before =
        section === 'legendaryActions' ? rowsOf(getValues(), 'legendaryActions').length : 0
      editors[section].appendRow(row)
      if (
        section === 'legendaryActions' &&
        before === 0 &&
        legendaryUsesUnset(getValues('legendaryActionUses'))
      ) {
        setValue('legendaryActionUses', 3, { shouldDirty: true })
      }
      setSelectedActionId(row.id)
      setNotice(null)
    },
    [editors, getValues, setValue],
  )

  const commitEquippedWeapon = useCallback(
    (section: MonsterActionSection, equipmentId: string, name: string) => {
      const { entry, action } = createEquippedWeaponAcquisition(equipmentId)
      const equipment = [...(getValues('equipment') ?? []), entry]
      setValue('equipment', equipment, { shouldDirty: true })
      const before =
        section === 'legendaryActions' ? rowsOf(getValues(), 'legendaryActions').length : 0
      editors[section].appendRow(action)
      if (
        section === 'legendaryActions' &&
        before === 0 &&
        legendaryUsesUnset(getValues('legendaryActionUses'))
      ) {
        setValue('legendaryActionUses', 3, { shouldDirty: true })
      }
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
      const legendaryBefore = rowsOf(getValues(), 'legendaryActions').length
      if (located.section === 'actions') {
        const actions = stripMultiattackActionId(rowsOf(getValues(), 'actions'), actionId).filter(
          (action) => action.id !== actionId,
        )
        setValue('actions', actions, { shouldDirty: true })
        setValue(
          'legendaryActions',
          stripMultiattackActionId(rowsOf(getValues(), 'legendaryActions'), actionId),
          { shouldDirty: true },
        )
        setValue(
          'reactions',
          stripMultiattackActionId(rowsOf(getValues(), 'reactions'), actionId),
          { shouldDirty: true },
        )
      } else {
        editors[located.section].removeAt(located.index)
      }
      if (located.section === 'legendaryActions' && legendaryBefore === 1) {
        setValue('legendaryActionUses', undefined as never, { shouldDirty: true })
        setValue('legendaryActionUsesInLair', undefined as never, { shouldDirty: true })
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
      const castingDependents = monsterCastingDependentLabels(getValues(), actionId)
      if (castingDependents.length > 0) {
        setNotice(formatCastingSourceDeleteNotice(castingDependents))
        return
      }
      const references =
        located.section === 'actions'
          ? multiattacksReferencingAction(
              [
                ...rowsOf(getValues(), 'actions'),
                ...rowsOf(getValues(), 'legendaryActions'),
                ...rowsOf(getValues(), 'reactions'),
              ],
              actionId,
            )
          : []
      if (references.length > 0) {
        setPending({
          type: 'multiattack-delete',
          actionId,
          names: references.map((action) => monsterActionReferenceTitle(action)),
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
      if (!located || !monsterActionSectionMoveAllowed(located.action, located.section, to)) return
      const referenceRows = [
        ...rowsOf(getValues(), 'actions'),
        ...rowsOf(getValues(), 'legendaryActions'),
        ...rowsOf(getValues(), 'reactions'),
      ]
      if (
        located.section === 'actions' &&
        to !== 'actions' &&
        multiattacksReferencingAction(referenceRows, located.action.id).length > 0
      ) {
        const references = multiattacksReferencingAction(referenceRows, located.action.id)
        setPending({
          type: 'multiattack-move',
          actionId: located.action.id,
          names: references.map((action) => monsterActionReferenceTitle(action)),
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

  const selectAction = useCallback(
    (actionId: string | null) => {
      setSelectedActionId(actionId)
      selectLocatedEditor(actionId)
    },
    [selectLocatedEditor],
  )

  useEffect(() => {
    selectLocatedEditor(selectedActionId)
  }, [selectLocatedEditor, selectedActionId])

  const requestDelete = useCallback((actionId: string) => {
    setDeleteTargetId(actionId)
  }, [])

  const cancelDelete = useCallback(() => {
    setDeleteTargetId(null)
  }, [])

  const confirmDelete = useCallback(() => {
    if (!deleteTargetId) return
    commitRemove(deleteTargetId)
    setDeleteTargetId(null)
  }, [commitRemove, deleteTargetId])

  const duplicateSelected = useCallback(() => {
    const located = locate(selectedActionId)
    if (!located) return
    const copy = duplicateMasterDetailRow(located.action)
    if (!copy || typeof copy.id !== 'string') return
    editors[located.section].appendRow(copy)
    setSelectedActionId(copy.id)
  }, [editors, locate, selectedActionId])

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
    selectAction,
    deleteTargetId,
    requestDelete,
    cancelDelete,
    confirmDelete,
    duplicateSelected,
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
