import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import type { MonsterFormValues } from '../monster-form-values'
import {
  resolveTraitStatBlockRulesFacingForFormRow,
  type TraitStatBlockRulesFacing,
} from './resolve-trait-stat-block-rules-facing'

function monsterContextFromForm(values: {
  name?: string
  lair?: MonsterFormValues['lair']
  forms?: MonsterFormValues['forms']
}): Pick<MonsterFormValues, 'name' | 'lair' | 'forms'> {
  return {
    name: values.name ?? '',
    lair: values.lair,
    forms: values.forms,
  }
}

export function useMonsterTraitRulesPreviewPresentation(
  row: unknown,
): TraitStatBlockRulesFacing | null {
  const name = useWatch<MonsterFormValues, 'name'>({ name: 'name' })
  const lair = useWatch<MonsterFormValues, 'lair'>({ name: 'lair' })
  const forms = useWatch<MonsterFormValues, 'forms'>({ name: 'forms' })
  const config = isRecord(row) ? row.config : undefined

  return useMemo(() => {
    if (!isRecord(row)) return null
    const facing = resolveTraitStatBlockRulesFacingForFormRow({
      row,
      monster: monsterContextFromForm({ name, lair, forms }),
    })
    if (!facing || !facing.proseText.trim()) return null
    return facing
  }, [config, forms, lair, name, row])
}

function isRecord(row: unknown): row is Record<string, unknown> {
  return typeof row === 'object' && row !== null
}
