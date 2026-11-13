import {
  formatMonsterLeap,
  formatMonsterLimitedUseHeading,
  formatMonsterTakeActions,
  formatMonsterTeleport,
  limitedUseSchema,
  type MonsterBonusActionDraft,
} from '@rpg/contracts'

import type { MonsterFormValues } from '../monster-form-values'

function escapePreviewText(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function readFeet(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined
}

function bonusSentence(monsterName: string, action: MonsterBonusActionDraft): string | undefined {
  if (action.kind === 'leap') {
    return formatMonsterLeap({
      monsterName,
      distanceFeet: readFeet(action.distanceFeet),
      movementFeet: readFeet(action.movementFeet),
    })
  }
  if (action.kind === 'teleport') {
    return formatMonsterTeleport({
      monsterName,
      distanceFeet: readFeet(action.distanceFeet),
      passenger: action.passenger,
    })
  }
  if (action.kind === 'take-actions') {
    return formatMonsterTakeActions({
      monsterName,
      standardActions: action.standardActions,
      combination: action.combination,
      restriction: action.restriction,
    })
  }
  return undefined
}

/** Stat-block sentence for a leap, teleport, or take-actions draft. */
export function buildMonsterActionBonusPreview(input: {
  values: MonsterFormValues
  action: MonsterBonusActionDraft
}): { bodyHtml: string } | null {
  const sentence = bonusSentence(input.values.name?.trim() ?? '', input.action)
  if (!sentence) return null
  const limitedUse = limitedUseSchema.safeParse(
    'limitedUse' in input.action ? input.action.limitedUse : undefined,
  )
  const heading = formatMonsterLimitedUseHeading(
    input.action.name?.trim() || '',
    limitedUse.success ? limitedUse.data : undefined,
  )
  const headingHtml = heading ? `<p>${escapePreviewText(heading)}</p>` : ''
  return { bodyHtml: `${headingHtml}<p>${escapePreviewText(sentence)}</p>` }
}
