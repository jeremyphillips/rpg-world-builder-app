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

export type BuilderChoiceBlock = {
  choiceSet: ChoiceSet
  heading: string
  sourceLine?: string
  selectedCount: number
  min: number
  max: number
  poolDescription: string
  compactAddLabel: string
  isFull: boolean
  isOverSelected: boolean
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

export type BuilderFactSummaryRow = {
  id: string
  label: string
  value: string
}
