import { useCallback, useContext, useEffect, useState, createContext, type ReactNode } from 'react'
import { useFormContext, useFormState, type FieldValues } from 'react-hook-form'
import { Alert, Button } from '@rpg/ui'
import type { ArmorClassRules } from '@rpg/contracts'

export function armorClassRulesSignature(rules: ArmorClassRules | undefined): string {
  return rules ? `${rules.mode}:${rules.base}` : 'none'
}

type ArmorClassAuthoringSession = {
  sensitive: boolean
  live: ArmorClassRules | undefined
  snapshot: ArmorClassRules | undefined
  generation: number
  keptValues: FieldValues | null
  saveWithoutDirty: boolean
  adoptLive: (rules: ArmorClassRules | undefined) => void
  keepValues: (values: FieldValues, rules: ArmorClassRules | undefined) => void
}

const ArmorClassAuthoringContext = createContext<ArmorClassAuthoringSession | null>(null)

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

export function ArmorClassAuthoringProvider({
  value,
  children,
}: {
  value: ArmorClassAuthoringSession
  children: ReactNode
}) {
  return (
    <ArmorClassAuthoringContext.Provider value={value}>
      {children}
    </ArmorClassAuthoringContext.Provider>
  )
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

/** Re-hydrates a pristine form when live rules change, and blocks a dirty form. */
export function ArmorClassAuthoringNotice() {
  const session = useContext(ArmorClassAuthoringContext)
  const form = useFormContext()
  const { isDirty } = useFormState()

  useEffect(() => {
    if (!session?.sensitive || isDirty) return
    if (armorClassRulesSignature(session.snapshot) === armorClassRulesSignature(session.live)) {
      return
    }
    session.adoptLive(session.live)
  }, [isDirty, session])

  if (!session?.sensitive || !isDirty) return null
  if (armorClassRulesSignature(session.snapshot) === armorClassRulesSignature(session.live)) {
    return null
  }

  return (
    <Alert
      variant="warning"
      title="Armor Class rules changed"
      description="Save is paused until you reload the form or keep your current numbers under the new rules."
      actions={
        <>
          <Button type="button" variant="outline" onClick={() => session.adoptLive(session.live)}>
            Discard changes and reload
          </Button>
          <Button type="button" onClick={() => session.keepValues(form.getValues(), session.live)}>
            Keep my values under new rules
          </Button>
        </>
      }
    />
  )
}
