'use client'

import {
  CHARACTER_HIT_POINT_LABELS,
  type CharacterHitPointsViewModel,
} from '../lib/character-display'
import { CharacterDetailStatTile } from './character-detail-stat-tile.client'
import {
  characterDetailHitPointsContainerClasses,
  characterDetailHitPointsGridClasses,
} from './character-detail-sheet.variants'

export type CharacterDetailHitPointsProps = {
  hitPoints: CharacterHitPointsViewModel
}

/** Current, max, and temporary hit point tiles in a single container. */
export function CharacterDetailHitPoints({ hitPoints }: CharacterDetailHitPointsProps) {
  return (
    <div className={characterDetailHitPointsContainerClasses}>
      <div className={characterDetailHitPointsGridClasses}>
        <CharacterDetailStatTile
          label={CHARACTER_HIT_POINT_LABELS.current}
          value={hitPoints.current}
          surface="outline"
        />
        <CharacterDetailStatTile
          label={CHARACTER_HIT_POINT_LABELS.max}
          value={hitPoints.max}
          surface="outline"
        />
        <CharacterDetailStatTile
          label={CHARACTER_HIT_POINT_LABELS.temporary}
          value={hitPoints.temporary}
          surface="outline"
        />
      </div>
    </div>
  )
}
