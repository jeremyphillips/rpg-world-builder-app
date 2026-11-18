import {
  formatMonsterFormQualifier,
  formatMonsterQualifiedHeading,
  monsterFormRestrictionEligibleIds,
  resolveCreatureFormsContext,
  type CreatureFormsDraft,
} from '@rpg/contracts'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import { formatMonsterMissingFormLabel } from './monster-form-labels'
import type { MonsterFormValues } from './monster-form-values'

export function monsterFormRestrictionLabels(
  forms: CreatureFormsDraft,
  creatureName: string,
): Map<string, string> {
  const eligibleIds = new Set(monsterFormRestrictionEligibleIds(forms))
  const names = new Map<string, string>()
  const context = resolveCreatureFormsContext(forms, creatureName)
  if (context.status === 'invalid') return names

  const register = (id: string, label: string) => {
    if (eligibleIds.has(id)) names.set(id, label.trim() || 'Untitled form')
  }

  if (context.profile?.id) register(context.profile.id, context.profile.name)
  for (const form of context.definedForms) {
    register(form.id, form.name)
  }
  return names
}

/** Stat-block heading with a form qualifier only — for RulesPreview titles. */
export function monsterQualifiedPreviewTitle(
  rowName: string | undefined,
  onlyInFormIds: readonly string[] | undefined,
  forms: CreatureFormsDraft | undefined,
  creatureName: string,
): string | undefined {
  if (onlyInFormIds === undefined) return undefined
  const knownNames = forms ? monsterFormRestrictionLabels(forms, creatureName) : new Map()
  const qualifier = formatMonsterFormQualifier(
    onlyInFormIds.map((id) => knownNames.get(id) ?? formatMonsterMissingFormLabel(id)),
  )
  if (!qualifier) return undefined
  return formatMonsterQualifiedHeading(rowName?.trim() || 'Untitled', { formQualifier: qualifier })
}

export function useMonsterQualifiedPreviewTitle(row: unknown): string | undefined {
  const forms = useWatch<MonsterFormValues, 'forms'>({ name: 'forms' })
  const creatureName = useWatch<MonsterFormValues, 'name'>({ name: 'name' })
  return useMemo(() => {
    if (!row || typeof row !== 'object' || !('onlyInFormIds' in row)) return undefined
    const source = row as { onlyInFormIds?: unknown; name?: unknown }
    if (!Array.isArray(source.onlyInFormIds)) return undefined
    const onlyInFormIds = source.onlyInFormIds.filter((id): id is string => typeof id === 'string')
    const name = typeof source.name === 'string' ? source.name : undefined
    return monsterQualifiedPreviewTitle(name, onlyInFormIds, forms, creatureName ?? '')
  }, [creatureName, forms, row])
}
