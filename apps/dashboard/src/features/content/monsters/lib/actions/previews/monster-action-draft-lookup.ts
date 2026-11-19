import {
  monsterActionSectionRows,
  type MonsterActionDraft,
  type MonsterActionSectionBody,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import type { MonsterFormValues } from '../../monster-form-values'
import { normalizeMonsterFormValues } from '../../normalize-monster-form-values'

export function findMonsterFormActionDraft(
  values: MonsterFormValues,
  ctx: ContentFormCtx,
  actionId: string,
): MonsterActionDraft | undefined {
  if (!values.armorClass || !values.hitPoints || !values.abilityScores) return undefined
  const normalized = normalizeMonsterFormValues(values, {
    intent: 'draft',
    mode: 'create',
    armorClassRules: ctx.armorClassRules,
  })
  const sections = ['actions', 'bonusActions', 'reactions', 'legendaryActions'] as const
  for (const section of sections) {
    const rows = monsterActionSectionRows(normalized as MonsterActionSectionBody, section)
    if (rows.length === 0) continue
    const match = rows.find((row) => {
      return Boolean(row) && typeof row === 'object' && 'id' in row && row.id === actionId
    })
    if (match && typeof match === 'object' && 'kind' in match) {
      return match as MonsterActionDraft
    }
  }
  return undefined
}
