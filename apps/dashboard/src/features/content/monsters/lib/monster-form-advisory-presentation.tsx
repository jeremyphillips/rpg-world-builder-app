import { AdvisoryAlert, type AdvisoryTone } from '@rpg/ui'
import { pathOwnsIssue, type FormItem } from '@rpg/ui/form'

import type { MonsterFormAdvisory } from './monster-form-advisories'

const MONSTER_FORM_ADVISORY_TONE = {
  'weapon-not-equipped': 'warning',
  'weapon-not-proficient': 'info',
  'tunneler-missing-burrow-speed': 'warning',
  'flyby-missing-fly-speed': 'warning',
  'multiattack-unavailable-action': 'warning',
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

/** Renders the parent collection for one row. Does not watch the form or collect. */
export function monsterFormAdvisorySlot(
  advisories: readonly MonsterFormAdvisory[],
  rowPath: string,
): FormItem {
  const matches = advisoriesForRowPath(advisories, rowPath)
  return {
    kind: 'slot',
    name: 'buildAdvisories',
    render: () => {
      if (matches.length === 0) return null
      return (
        <div className="flex flex-col gap-2">
          {matches.map((advisory) => (
            <AdvisoryAlert
              key={advisory.code}
              tone={monsterFormAdvisoryTone(advisory.code)}
              message={advisory.message}
            />
          ))}
        </div>
      )
    },
  }
}
