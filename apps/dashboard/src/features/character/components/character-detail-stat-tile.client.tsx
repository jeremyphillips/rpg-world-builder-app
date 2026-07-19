'use client'

import { cn, Eyebrow } from '@rpg/ui'

import {
  characterDetailStatTileCaptionClasses,
  characterDetailStatTileValueClasses,
  characterDetailStatTileVariants,
} from './character-detail-sheet.variants'

export type CharacterDetailStatTileProps = {
  label: string
  value: string
  caption?: string
  surface?: 'subtle' | 'strong' | 'outline'
  className?: string
}

/** Centered stat tile — eyebrow label, primary value, optional caption. */
export function CharacterDetailStatTile({
  label,
  value,
  caption,
  surface = 'subtle',
  className,
}: CharacterDetailStatTileProps) {
  return (
    <div className={cn(characterDetailStatTileVariants({ surface }), className)}>
      <Eyebrow size="xs" className="w-full uppercase">
        {label}
      </Eyebrow>
      <div className="flex flex-1 items-center justify-center py-2">
        <span className={characterDetailStatTileValueClasses}>{value}</span>
      </div>
      {caption ? <p className={characterDetailStatTileCaptionClasses}>{caption}</p> : null}
    </div>
  )
}
