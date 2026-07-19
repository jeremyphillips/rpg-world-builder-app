'use client'

import type { CharacterAbilityTile } from '../lib/character-display'
import { CharacterDetailStatTile } from './character-detail-stat-tile.client'
import {
  characterDetailAbilitiesContainerClasses,
  characterDetailAbilitiesGridClasses,
} from './character-detail-sheet.variants'

export type CharacterDetailAbilitiesRowProps = {
  abilities: CharacterAbilityTile[]
}

/** Six-up ability score grid inside a subtle surface container. */
export function CharacterDetailAbilitiesRow({ abilities }: CharacterDetailAbilitiesRowProps) {
  return (
    <div className={characterDetailAbilitiesContainerClasses}>
      <div className={characterDetailAbilitiesGridClasses}>
        {abilities.map((ability) => (
          <CharacterDetailStatTile
            key={ability.id}
            label={ability.label}
            value={ability.score}
            caption={ability.modifier}
            surface="outline"
          />
        ))}
      </div>
    </div>
  )
}
