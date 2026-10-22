import { ABILITY_SCORE_MIN, CHARACTER_ABILITY_SCORE_MAX, type Ability } from '@rpg/contracts'

import { Panel } from '@rpg/ui'

import { AbilityScoreCard, AbilityScoreNumeric } from '@/components/ability-score'

import type { CharacterAbilityTile } from '../../../lib/display/character-display'
import {
  characterDetailAbilitiesRowClasses,
  characterDetailStatTileCompactWidthClasses,
} from './character-detail-sheet.variants'

export type CharacterDetailAbilityScoreEditor = {
  abilityScores: Partial<Record<Ability, number>>
  onCommit: (ability: Ability, score: number) => Promise<void>
  isAbilityPending: (ability: Ability) => boolean
}

export type CharacterDetailAbilitiesRowProps = {
  abilities: CharacterAbilityTile[]
  abilityScoreEditor?: CharacterDetailAbilityScoreEditor
}

/** Six ability score cards inline at the start of a subtle surface container. */
export function CharacterDetailAbilitiesRow({
  abilities,
  abilityScoreEditor,
}: CharacterDetailAbilitiesRowProps) {
  return (
    <Panel tone="transparent" density="comfortable" className="w-fit">
      <div className={characterDetailAbilitiesRowClasses}>
        {abilities.map((ability) => {
          const abilityId = ability.id as Ability
          const editorScore = abilityScoreEditor?.abilityScores[abilityId]
          const displayScore =
            typeof editorScore === 'number' ? editorScore : Number.parseInt(ability.score, 10)

          return (
            <div key={ability.id} className={characterDetailStatTileCompactWidthClasses}>
              {abilityScoreEditor ? (
                <AbilityScoreNumeric
                  ability={abilityId}
                  value={Number.isFinite(displayScore) ? displayScore : null}
                  min={ABILITY_SCORE_MIN}
                  max={CHARACTER_ABILITY_SCORE_MAX}
                  size="md"
                  disabled={abilityScoreEditor.isAbilityPending(abilityId)}
                  onCommit={(value) => {
                    if (value === null) return
                    void abilityScoreEditor.onCommit(abilityId, value)
                  }}
                />
              ) : (
                <AbilityScoreCard
                  ability={abilityId}
                  value={Number.isFinite(displayScore) ? displayScore : null}
                  size="md"
                />
              )}
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
