'use client'

import { cn, Eyebrow } from '@rpg/ui'

import {
  CHARACTER_HIT_POINT_LABELS,
  type CharacterDetailStatTileFooter,
  type CharacterHitPointsViewModel,
} from '../lib/character-display'
import {
  characterDetailStatTileCompactWidthClasses,
  characterDetailStatTileEyebrowClasses,
  characterDetailStatTileFooterClasses,
  characterDetailStatTileFooterLabelClasses,
  characterDetailStatTileFooterMetaClasses,
  characterDetailStatTileHitPointsGridClasses,
  characterDetailStatTileHitPointsNumberClasses,
  characterDetailStatTileHitPointsPairClasses,
  characterDetailStatTileHitPointsSlashClasses,
  characterDetailStatTileHitPointsWidthClasses,
  characterDetailStatTileValueClasses,
  characterDetailStatTileVariants,
} from './character-detail-sheet.variants'

type CharacterDetailStatTileBaseProps = {
  surface?: 'subtle' | 'strong' | 'outline'
  className?: string
}

type CharacterDetailStatTileValueProps = CharacterDetailStatTileBaseProps & {
  variant?: 'value'
  label: string
  value: string
  footer?: CharacterDetailStatTileFooter
}

type CharacterDetailStatTileHitPointsProps = CharacterDetailStatTileBaseProps & {
  variant: 'hitPoints'
  label: string
  hitPoints: CharacterHitPointsViewModel
}

export type CharacterDetailStatTileProps =
  | CharacterDetailStatTileValueProps
  | CharacterDetailStatTileHitPointsProps

/** Centered stat tile — single value or a three-column hit point group. */
export function CharacterDetailStatTile(props: CharacterDetailStatTileProps) {
  const { surface = 'subtle', className } = props

  if (props.variant === 'hitPoints') {
    return (
      <div
        className={cn(
          characterDetailStatTileVariants({ surface }),
          characterDetailStatTileHitPointsWidthClasses,
          className,
        )}
      >
        <Eyebrow size="xs" className={cn('w-full', characterDetailStatTileEyebrowClasses)}>
          {props.label}
        </Eyebrow>
        <div className="flex w-full flex-1 items-center justify-center py-2">
          <CharacterDetailHitPointsGrid hitPoints={props.hitPoints} />
        </div>
        <CharacterDetailStatTileFooterSlot />
      </div>
    )
  }

  const { label, value, footer } = props

  return (
    <div
      className={cn(
        characterDetailStatTileVariants({ surface }),
        characterDetailStatTileCompactWidthClasses,
        className,
      )}
    >
      <Eyebrow size="xs" className={cn('w-full', characterDetailStatTileEyebrowClasses)}>
        {label}
      </Eyebrow>
      <div className="flex flex-1 items-center justify-center py-2">
        <span className={characterDetailStatTileValueClasses}>{value}</span>
      </div>
      <CharacterDetailStatTileFooterSlot footer={footer} />
    </div>
  )
}

function CharacterDetailStatTileFooterSlot({ footer }: { footer?: CharacterDetailStatTileFooter }) {
  return (
    <div className={characterDetailStatTileFooterClasses}>
      {footer?.kind === 'meta' ? (
        <p className={characterDetailStatTileFooterMetaClasses}>{footer.text}</p>
      ) : null}
      {footer?.kind === 'label' ? (
        <Eyebrow size="xs" className={characterDetailStatTileFooterLabelClasses}>
          {footer.text}
        </Eyebrow>
      ) : null}
    </div>
  )
}

function CharacterDetailHitPointsGrid({ hitPoints }: { hitPoints: CharacterHitPointsViewModel }) {
  return (
    <div className={characterDetailStatTileHitPointsGridClasses}>
      <Eyebrow
        size="xs"
        className={cn('col-start-1 row-start-1 w-full', characterDetailStatTileEyebrowClasses)}
      >
        {CHARACTER_HIT_POINT_LABELS.current}
      </Eyebrow>
      <Eyebrow
        size="xs"
        className={cn('col-start-2 row-start-1 w-full', characterDetailStatTileEyebrowClasses)}
      >
        {CHARACTER_HIT_POINT_LABELS.max}
      </Eyebrow>
      <Eyebrow
        size="xs"
        className={cn('col-start-3 row-start-1 w-full', characterDetailStatTileEyebrowClasses)}
      >
        {CHARACTER_HIT_POINT_LABELS.temporary}
      </Eyebrow>

      <div className="col-span-2 col-start-1 row-start-2 flex items-start justify-center">
        <div className={characterDetailStatTileHitPointsPairClasses}>
          <span className={characterDetailStatTileHitPointsNumberClasses}>{hitPoints.current}</span>
          <span aria-hidden className={characterDetailStatTileHitPointsSlashClasses}>
            /
          </span>
          <span className={characterDetailStatTileHitPointsNumberClasses}>{hitPoints.max}</span>
        </div>
      </div>

      <div className="col-start-3 row-start-2 flex items-start justify-center">
        <span className={characterDetailStatTileValueClasses}>{hitPoints.temporary}</span>
      </div>
    </div>
  )
}
