import { useContext, useEffect, type ReactNode } from 'react'
import { useFormContext, useFormState } from 'react-hook-form'
import { Alert, Button } from '@rpg/ui'

import {
  ArmorClassAuthoringContext,
  armorClassRulesSignature,
  type ArmorClassAuthoringSession,
} from './armor-class-authoring-session.lib'

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
