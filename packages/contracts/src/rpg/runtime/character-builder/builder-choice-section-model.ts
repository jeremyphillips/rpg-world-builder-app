import type { ChoiceSet } from './choice-set'

export type BuilderChoiceAggregateCount = {
  selected: number
  max: number
  label: string
}

export type BuilderChoiceSelectedRow = {
  optionId: string
  label: string
  choiceSetId: string
  isStale: boolean
  staleReason?: string
  isRemovable: true
}

export type BuilderChoiceGrantedRow = {
  id: string
  label: string
  sourceLabel: string
  sublabel?: string
}

/** Optional level-scoped counter display; validation still uses global selectedCount/max on the block. */
export type BuilderChoiceDisplayCount = {
  selected: number
  max: number
}

export type BuilderChoiceBlock = {
  choiceSet: ChoiceSet
  heading: string
  sourceLine?: string
  /** Global ChoiceSet selection count — drives validation, add/manage, and isFull. */
  selectedCount: number
  min: number
  max: number
  /** When set, UI counters show this level-scoped composition instead of selectedCount/max. */
  displayCount?: BuilderChoiceDisplayCount
  poolDescription: string
  compactAddLabel: string
  isFull: boolean
  isOverSelected: boolean
}

export function resolveChoiceBlockCounterValues(block: BuilderChoiceBlock): {
  selected: number
  max: number
} {
  return {
    selected: block.displayCount?.selected ?? block.selectedCount,
    max: block.displayCount?.max ?? block.max,
  }
}

/** Shared builder step section chrome — proficiencies and spells map into this shape. */
export type BuilderChoiceSectionModel = {
  id: string
  heading: string
  subhead: string
  identityLine?: string
  aggregateCount: BuilderChoiceAggregateCount | null
  selectedRows: BuilderChoiceSelectedRow[]
  grantedRows: BuilderChoiceGrantedRow[]
  choiceBlocks: BuilderChoiceBlock[]
  emptyMessage: string
  isOverSelected: boolean
}

export type BuilderFactSummaryIconKey = 'spellcasting-ability' | 'spell-save-dc' | 'spell-attack'

export type BuilderFactSummaryRow = {
  id: string
  label: string
  value: string
  icon?: BuilderFactSummaryIconKey
}
