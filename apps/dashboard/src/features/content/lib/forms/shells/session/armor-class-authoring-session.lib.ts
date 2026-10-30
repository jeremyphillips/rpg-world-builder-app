import { useCallback, useContext, useState, createContext } from 'react'
import { useFormState, type FieldValues } from 'react-hook-form'
import type { ArmorClassRules } from '@rpg/contracts'

export function armorClassRulesSignature(rules: ArmorClassRules | undefined): string {
  return rules ? `${rules.mode}:${rules.base}` : 'none'
}

export type ArmorClassAuthoringSession = {
  sensitive: boolean
  live: ArmorClassRules | undefined
  snapshot: ArmorClassRules | undefined
  generation: number
  keptValues: FieldValues | null
  saveWithoutDirty: boolean
  adoptLive: (rules: ArmorClassRules | undefined) => void
  keepValues: (values: FieldValues, rules: ArmorClassRules | undefined) => void
}

export const ArmorClassAuthoringContext = createContext<ArmorClassAuthoringSession | null>(null)

export function useArmorClassAuthoringSession(
  sensitive: boolean,
  live: ArmorClassRules | undefined,
): ArmorClassAuthoringSession {
  const [snapshot, setSnapshot] = useState(live)
  const [generation, setGeneration] = useState(0)
  const [keptValues, setKeptValues] = useState<FieldValues | null>(null)
  const [saveWithoutDirty, setSaveWithoutDirty] = useState(false)

  const adoptLive = useCallback((rules: ArmorClassRules | undefined) => {
    setSnapshot(rules)
    setKeptValues(null)
    setSaveWithoutDirty(false)
    setGeneration((current) => current + 1)
  }, [])

  const keepValues = useCallback((values: FieldValues, rules: ArmorClassRules | undefined) => {
    setKeptValues(values)
    setSnapshot(rules)
    setSaveWithoutDirty(true)
    setGeneration((current) => current + 1)
  }, [])

  return {
    sensitive,
    live,
    snapshot: sensitive ? snapshot : live,
    generation,
    keptValues: sensitive ? keptValues : null,
    saveWithoutDirty: sensitive && saveWithoutDirty,
    adoptLive,
    keepValues,
  }
}

export function useArmorClassAuthoringSave(): { saveWithoutDirty: boolean } {
  const session = useContext(ArmorClassAuthoringContext)
  return { saveWithoutDirty: session?.saveWithoutDirty ?? false }
}

export function useArmorClassRulesStale(): boolean {
  const session = useContext(ArmorClassAuthoringContext)
  const { isDirty } = useFormState()
  if (!session?.sensitive || !isDirty) return false
  return armorClassRulesSignature(session.snapshot) !== armorClassRulesSignature(session.live)
}
