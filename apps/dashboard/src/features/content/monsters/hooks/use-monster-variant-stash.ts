import { useCallback, useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useFormUiContext } from '@rpg/ui/form'

import type { MonsterFormValues } from '../lib/monster-form-values'
import {
  EMPTY_MONSTER_VARIANT_STASH,
  transitionArmorClass,
  transitionHitPoints,
  type MonsterArmorClassKind,
  type MonsterVariantStash,
} from '../lib/monster-variant-transitions'

function valuesMatch(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

/**
 * Session stash for inactive AC and HP variants.
 * Cleared on successful save, discard, and record change. Stash writes do not call setValue.
 */
export function useMonsterVariantStash(recordId?: string) {
  const form = useFormContext<MonsterFormValues>()
  const { sessionResetGeneration = 0 } = useFormUiContext()
  const [stash, setStash] = useState<MonsterVariantStash>(EMPTY_MONSTER_VARIANT_STASH)
  const stashRef = useRef(stash)
  const generationRef = useRef(sessionResetGeneration)
  const recordRef = useRef(recordId)

  const clear = useCallback(() => {
    stashRef.current = EMPTY_MONSTER_VARIANT_STASH
    setStash(EMPTY_MONSTER_VARIANT_STASH)
  }, [])

  useEffect(() => {
    if (generationRef.current === sessionResetGeneration) return
    generationRef.current = sessionResetGeneration
    clear()
  }, [clear, sessionResetGeneration])

  useEffect(() => {
    if (recordRef.current === recordId) return
    recordRef.current = recordId
    clear()
  }, [clear, recordId])

  const writeField = useCallback(
    (name: 'armorClass' | 'hitPoints', value: MonsterFormValues[typeof name]) => {
      const nextValues = { ...form.getValues(), [name]: value }
      const baseline = form.formState.defaultValues?.[name]
      if (valuesMatch(value, baseline)) {
        form.reset(nextValues, { keepDefaultValues: true })
        return
      }
      form.setValue(name, value, { shouldDirty: true })
    },
    [form],
  )

  const switchArmorClass = useCallback(
    (nextKind: MonsterArmorClassKind, calculatedAc?: number) => {
      const current = form.getValues('armorClass')
      const result = transitionArmorClass(
        current,
        nextKind,
        stashRef.current.armorClass,
        calculatedAc,
      )
      stashRef.current = { ...stashRef.current, armorClass: result.stash }
      setStash(stashRef.current)
      writeField('armorClass', result.armorClass)
    },
    [form, writeField],
  )

  const switchHitPoints = useCallback(
    (nextKind: MonsterFormValues['hitPoints']['kind'], prefill?: { average?: number }) => {
      const current = form.getValues('hitPoints')
      const result = transitionHitPoints(current, nextKind, stashRef.current.hitPoints, prefill)
      stashRef.current = { ...stashRef.current, hitPoints: result.stash }
      setStash(stashRef.current)
      writeField('hitPoints', result.hitPoints)
    },
    [form, writeField],
  )

  return { stash, switchArmorClass, switchHitPoints, clear }
}
