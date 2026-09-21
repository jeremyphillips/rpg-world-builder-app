import type { ChoiceCounterVerb } from './format-spell-acquisition-copy'
import type { ChoiceSet } from './choice-set'

export type BuilderChoiceAggregateCount = {
  selected: number
  max: number
  label: string
  verb?: ChoiceCounterVerb
  requiredToComplete?: boolean
  /** Builder completion threshold — may be below authored max when the pool is limited. */
  effectiveRequiredCount?: number
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
  availabilityMessage?: string
  counterVerb?: ChoiceCounterVerb
  requiredToComplete?: boolean
  effectiveRequiredCount?: number
  compactAddLabel: string
  isFull: boolean
  isOverSelected: boolean
  /** When false, hide add/manage for slice-empty or unavailable pools. */
  isInteractive?: boolean
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
  /** Acquisition or explanatory lines below the section subhead. */
  subheadLines?: string[]
  identityLine?: string
  aggregateCount: BuilderChoiceAggregateCount | null
  /** When set, the level slice has no eligible spells across all blocks. */
  levelSliceEmptyMessage?: string
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
