'use client'

import {
  CHARACTER_STAT_LABELS,
  type CharacterDetailStatTile as CharacterDetailStatTileModel,
  type CharacterHitPointsViewModel,
} from '../lib/character-display'
import { CharacterDetailStatTile } from './character-detail-stat-tile.client'
import { characterDetailStatsRowClasses } from './character-detail-sheet.variants'

export type CharacterDetailStatsRowProps = {
  stats: CharacterDetailStatTileModel[]
  hitPoints: CharacterHitPointsViewModel
}

/** Inline combat stats — AC, initiative, speed, proficiency bonus, and hit points. */
export function CharacterDetailStatsRow({ stats, hitPoints }: CharacterDetailStatsRowProps) {
  return (
    <div className={characterDetailStatsRowClasses}>
      {stats.map((stat) => (
        <CharacterDetailStatTile
          key={stat.id}
          label={stat.label}
          value={stat.value}
          footer={stat.footer}
          className="shrink-0"
        />
      ))}
      <CharacterDetailStatTile
        variant="hitPoints"
        label={CHARACTER_STAT_LABELS.hitPoints}
        hitPoints={hitPoints}
        className="shrink-0"
      />
    </div>
  )
}
