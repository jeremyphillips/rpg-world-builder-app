import type { MonsterAttackActionSentenceParts } from './format-monster-attack-action'
import {
  statBlockProseSpacing,
  type StatBlockProse,
  type StatBlockProseSegment,
} from '../prose/stat-block-prose'

export function monsterAttackActionPartsToProse(
  parts: MonsterAttackActionSentenceParts,
): StatBlockProse {
  const segments: StatBlockProseSegment[] = [
    { kind: 'lead', treatment: 'inline', label: parts.attackLabel },
    { kind: 'text', value: ` ${parts.bonusAndDistance}` },
  ]
  if (parts.hitBody) {
    segments.push(
      statBlockProseSpacing(),
      { kind: 'lead', treatment: 'inline', label: 'Hit' },
      { kind: 'text', value: ` ${parts.hitBody}.` },
    )
  }
  return segments
}
