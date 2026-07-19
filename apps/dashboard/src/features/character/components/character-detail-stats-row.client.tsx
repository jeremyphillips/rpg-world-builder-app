'use client'

import type { CharacterDetailStatTile as CharacterDetailStatTileModel } from '../lib/character-display'
import { CharacterDetailStatTile } from './character-detail-stat-tile.client'
import { characterDetailStatsRowClasses } from './character-detail-sheet.variants'

export type CharacterDetailStatsRowProps = {
  stats: CharacterDetailStatTileModel[]
}

/** Inline combat stats — AC, initiative, speed, and proficiency bonus. */
export function CharacterDetailStatsRow({ stats }: CharacterDetailStatsRowProps) {
  return (
    <div className={characterDetailStatsRowClasses}>
      {stats.map((stat) => (
        <CharacterDetailStatTile
          key={stat.id}
          label={stat.label}
          value={stat.value}
          caption={stat.caption}
          className="min-w-28 flex-1"
        />
      ))}
    </div>
  )
}
