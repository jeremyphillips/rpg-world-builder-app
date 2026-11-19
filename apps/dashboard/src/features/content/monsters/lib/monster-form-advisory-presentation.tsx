import type { AdvisoryTone } from '@rpg/ui'
import { pathOwnsIssue, type DisplayConfig } from '@rpg/ui/form'

import type { MonsterFormAdvisory } from './monster-form-advisories'

const MONSTER_FORM_ADVISORY_TONE = {
  'weapon-not-equipped': 'warning',
  'weapon-not-proficient': 'info',
  'tunneler-missing-burrow-speed': 'warning',
  'flyby-missing-fly-speed': 'warning',
  'leap-missing-walk-speed': 'warning',
  'leap-zero-walk-speed': 'warning',
  'leap-movement-exceeds-walk-speed': 'warning',
  'multiattack-unavailable-action': 'warning',
  'form-restricted-reference': 'info',
  'form-restricted-multiattack': 'info',
} as const satisfies Record<MonsterFormAdvisory['code'], AdvisoryTone>

/** Presentation tone for a collector code. Unknown codes still render, as warning. */
export function monsterFormAdvisoryTone(code: string): AdvisoryTone {
  if (Object.hasOwn(MONSTER_FORM_ADVISORY_TONE, code)) {
    return MONSTER_FORM_ADVISORY_TONE[code as MonsterFormAdvisory['code']]
  }
  return 'warning'
}

/** Segment-aware row match. `actions.1` owns `actions.1.note` and not `actions.10`. */
export function advisoriesForRowPath(
  advisories: readonly MonsterFormAdvisory[],
  rowPath: string,
): MonsterFormAdvisory[] {
  return advisories.filter((advisory) => pathOwnsIssue(rowPath, advisory.path))
}

export const MONSTER_ROW_ADVISORY_DISPLAY_ID_PREFIX = 'monster-row-advisories-'

function monsterRowAdvisoryDisplayId(rowPath: string): string {
  return `${MONSTER_ROW_ADVISORY_DISPLAY_ID_PREFIX}${rowPath.replaceAll('.', '-')}`
}

/** Read-only advisories for one action/trait row, scoped by `rowPath`. */
export function monsterFormAdvisoryDisplay(
  advisories: readonly MonsterFormAdvisory[],
  rowPath: string,
): DisplayConfig {
  const matches = advisoriesForRowPath(advisories, rowPath)
  return {
    kind: 'display',
    id: monsterRowAdvisoryDisplayId(rowPath),
    content: matches.map((advisory) => ({
      variant: 'notice',
      notice: {
        tone: monsterFormAdvisoryTone(advisory.code),
        message: advisory.message,
      },
    })),
  }
}

export function isMonsterRowAdvisoryDisplay(item: { kind?: string; id?: string }): boolean {
  return (
    item.kind === 'display' && Boolean(item.id?.startsWith(MONSTER_ROW_ADVISORY_DISPLAY_ID_PREFIX))
  )
}
