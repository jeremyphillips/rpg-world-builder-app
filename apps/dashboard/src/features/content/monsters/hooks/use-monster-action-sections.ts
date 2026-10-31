import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { useMasterDetailArray } from '../../lib/master-detail/use-master-detail-array'
import {
  createEquippedWeaponAcquisition,
  createMonsterActionFromAcquisition,
  type MonsterActionAcquisitionChoice,
} from '../lib/actions/monster-action-acquisition'
import { actionAfterSectionMove, actionMoveDropsTrigger } from '../lib/actions/monster-action-kind'
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

export type MonsterActionPending = TriggerPending

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
      if (from === to || from < 0 || to < 0) return
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

  const confirmPending = useCallback(() => {
    if (!pending || pending.type !== 'trigger') return
    commitMove(pending.from, pending.index, pending.to)
  }, [commitMove, pending])

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
    reorder,
    requestMove,
    confirmPending,
    locate,
    hasRowError: (section: MonsterActionSection, index: number) =>
      editors[section].hasRowError(index),
  }
}
