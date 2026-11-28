import type { MonsterPresetTraitForFormat } from '../../content/creature/trait-preset-schema'
import {
  formatSpiderClimbRuleClause,
  getCreatureTraitPresetSentence,
} from '../../content/creature/trait-presets'
import {
  movementModeAvailability,
  type CreatureMovementDefinition,
  type MovementModeAvailability,
} from '../../vocab/movement-mode'
import { getCreatureTraitVocabularyEntry } from '../../vocab/creature/trait-vocabulary'
import {
  formatCreatureTrait,
  type CreatureTraitPresetFormatRow,
  type FormattedCreatureTrait,
} from '../creature/format-creature-trait'

function formatMonsterSpiderClimbTrait(
  subject: string,
  climb: MovementModeAvailability,
): FormattedCreatureTrait | undefined {
  const entry = getCreatureTraitVocabularyEntry('spider-climb')
  if (!entry) return undefined
  const sentence =
    climb === 'alternative'
      ? `If ${subject} has a Climb Speed, ${formatSpiderClimbRuleClause(subject)}`
      : getCreatureTraitPresetSentence('spider-climb', subject)
  if (!sentence) return undefined
  return { name: entry.label, sentence }
}

/** Preset trait prose with movement-dependent Spider Climb applicability. */
export function formatMonsterPresetTrait(
  subject: string,
  trait: MonsterPresetTraitForFormat,
  movement: CreatureMovementDefinition,
): FormattedCreatureTrait | undefined {
  if (trait.preset === 'spider-climb') {
    return formatMonsterSpiderClimbTrait(subject, movementModeAvailability(movement, 'climb'))
  }
  // Draft publish output can widen duration `unit` to string; runtime formatter accepts the parsed row as-is.
  return formatCreatureTrait({ subject, trait: trait as CreatureTraitPresetFormatRow })
}
