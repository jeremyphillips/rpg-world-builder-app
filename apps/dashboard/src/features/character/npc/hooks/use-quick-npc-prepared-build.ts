import * as React from 'react'
import { useWatch, type UseFormReturn } from 'react-hook-form'

import type { CharacterBuildContext } from '@rpg/contracts'

import { QuickNpcPreparedBuildContext } from '../components/quick-npc/quick-npc-prepared-build-store'
import { resolveQuickNpcAuthoringPreparedDraft } from '../lib/quick-npc/quick-npc-authoring-submit.lib'
import type { QuickNpcCreateContext } from '../lib/quick-npc/quick-npc-create-context'
import type { QuickNpcPreparedDraft } from '../lib/quick-npc/quick-npc-create'
import {
  QUICK_NPC_GENERATE_NARRATIVE_FIELD_NAME,
  quickNpcAuthoringTabDefaultValues,
  type QuickNpcAuthoringTabFormValues,
  type QuickNpcAuthoringTabValues,
  type QuickNpcSetupValues,
} from '../lib/quick-npc/quick-npc-form-fields'

const noopSubscribe = () => () => {}
const readNull = () => null

/** Latest live prepared build; `null` outside a provider or before the first derivation. */
export function useQuickNpcPreparedBuildValue(): QuickNpcPreparedDraft | null {
  const store = React.useContext(QuickNpcPreparedBuildContext)
  return React.useSyncExternalStore(
    store?.subscribe ?? noopSubscribe,
    store?.get ?? readNull,
    store?.get ?? readNull,
  )
}

/** Memoized live derivation of the full prepared Quick NPC build from watched form values. */
export function useQuickNpcPreparedBuild({
  form,
  setup,
  buildContext,
  createContext,
}: {
  form: UseFormReturn<QuickNpcAuthoringTabFormValues>
  setup: QuickNpcSetupValues
  buildContext: CharacterBuildContext
  createContext: QuickNpcCreateContext
}): QuickNpcPreparedDraft | null {
  const watched = useWatch({ control: form.control })
  const {
    name,
    gender,
    alignment,
    equipmentSelections,
    requiredSpellIds,
    startingChoiceOverrides,
    classPackage,
  } = watched

  return React.useMemo(() => {
    const tabValues = {
      ...quickNpcAuthoringTabDefaultValues,
      name,
      gender,
      alignment,
      equipmentSelections,
      requiredSpellIds,
      startingChoiceOverrides,
      classPackage,
      [QUICK_NPC_GENERATE_NARRATIVE_FIELD_NAME]: false,
    } as QuickNpcAuthoringTabValues
    try {
      return resolveQuickNpcAuthoringPreparedDraft({
        createContext,
        setup,
        tabValues,
        buildContext,
      })
    } catch {
      return null
    }
  }, [
    alignment,
    buildContext,
    classPackage,
    createContext,
    equipmentSelections,
    gender,
    name,
    requiredSpellIds,
    setup,
    startingChoiceOverrides,
  ])
}
