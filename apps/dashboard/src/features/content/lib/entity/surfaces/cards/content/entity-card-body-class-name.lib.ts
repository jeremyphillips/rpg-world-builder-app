import { borderStrength } from '@rpg/ui'

export type EntityCardBodyWash = 'disclosure' | 'catalog'

/** Expanded entity card body block plus disclosure or catalog wash modifier. */
export function entityCardBodyClassName(wash: EntityCardBodyWash): string {
  const modifier =
    wash === 'disclosure'
      ? 'dash-entity-card__body--disclosure-wash'
      : 'dash-entity-card__body--catalog-wash'
  return `dash-entity-card__body ${modifier} ${borderStrength('subtle')}`
}
