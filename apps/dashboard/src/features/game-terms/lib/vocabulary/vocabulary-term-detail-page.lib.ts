import {
  DEFAULT_SYSTEM_RULESET_ID,
  type VocabularyOptionSetId,
  type VocabularyOptionWithUsage,
  type VocabularySetCapability,
} from '@rpg/contracts'

import { resolveGameTermDisplay } from '../game-term-display'

export function shouldShowGameTermMediaField(
  setId: VocabularyOptionSetId,
  entry: VocabularyOptionWithUsage,
  capabilities: VocabularySetCapability,
): boolean {
  if (capabilities.media) return true
  return (
    resolveGameTermDisplay({
      setId,
      option: entry,
      rulesetId: DEFAULT_SYSTEM_RULESET_ID,
      surface: 'field',
    }).outcome === 'image'
  )
}
