'use client'

import type { CharacterAbilityTile } from '../../lib/character-display'
import { CharacterDetailStatTile } from './character-detail-stat-tile.client'
import {
  characterDetailAbilitiesContainerClasses,
  characterDetailAbilitiesRowClasses,
} from './character-detail-sheet.variants'

export type CharacterDetailAbilitiesRowProps = {
  abilities: CharacterAbilityTile[]
}

/** Six ability score tiles inline at the start of a subtle surface container. */
export function CharacterDetailAbilitiesRow({ abilities }: CharacterDetailAbilitiesRowProps) {
  return (
    <div className={characterDetailAbilitiesContainerClasses}>
      <div className={characterDetailAbilitiesRowClasses}>
        {abilities.map((ability) => (
          <CharacterDetailStatTile
            key={ability.id}
            label={ability.label}
            value={ability.score}
            footer={{ kind: 'meta', text: ability.modifier }}
            surface="outline"
          />
        ))}
      </div>
    </div>
  )
}
