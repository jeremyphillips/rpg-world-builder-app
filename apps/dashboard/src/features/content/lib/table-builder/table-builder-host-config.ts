import type {
  TableBuilderCellDraft,
  TableBuilderColumnDraft,
  TableBuilderFormValues,
} from './table-builder-draft'
import type { TableBuilderKind } from './table-builder-kind'

/** Modal lifecycle — kind may change only while creating a new table. */
export type TableBuilderMode = 'create' | 'edit'

export type TableBuilderColumnsMode = 'editable' | 'fixed'
export type TableBuilderRowsMode = 'editable' | 'fixedLevels'

export type TableBuilderCellPresentationContext = {
  draft: TableBuilderFormValues
  rowIndex: number
  level?: number
  columnKey: string
  draftValue: TableBuilderCellDraft | undefined
}

export type TableBuilderCellPresentation = {
  /** Shown when the draft cell is blank. Never written into RHF. */
  placeholder?: string
  readOnly?: boolean
  /** Host-owned provenance chip rendered inside input chrome. */
  provenanceBadge?: 'derived'
}

export type TableBuilderExtendedProgression = {
  standardMaxLevel: number
  tierName: string
}

export type TableBuilderValuesNotice = {
  title: string
  description: string
}

/**
 * Host-owned table builder policy: which kinds are valid and which is recommended.
 * Whether kind can still change is owned by {@link TableBuilderMode}, not parent content status.
 */
export type TableBuilderHostConfig = {
  /** Non-empty — at least one kind must be allowed. */
  allowedKinds: readonly [TableBuilderKind, ...TableBuilderKind[]]
  /** Must be absent or a member of `allowedKinds`. */
  recommendedKind?: TableBuilderKind
  /** Semantic level set for the structural axis — progression tables only. */
  allowedLevels?: readonly number[]
  columns?: TableBuilderColumnsMode
  rows?: TableBuilderRowsMode
  fixedColumns?: readonly Pick<TableBuilderColumnDraft, 'label' | 'valueType' | 'format'>[]
  resolveCellPresentation?: (
    ctx: TableBuilderCellPresentationContext,
  ) => TableBuilderCellPresentation | undefined
  resolveValuesNotice?: (ctx: {
    draft: TableBuilderFormValues
  }) => TableBuilderValuesNotice | undefined
  /** When set on level-progression hosts, inserts a tier separator after standardMaxLevel. */
  extendedProgression?: TableBuilderExtendedProgression
}

export function resolveTableBuilderRecommendedKind(
  config: TableBuilderHostConfig,
): TableBuilderKind {
  return config.recommendedKind ?? config.allowedKinds[0]
}

export function isTableBuilderStructureConstrained(config: TableBuilderHostConfig): boolean {
  return config.columns === 'fixed' && config.rows === 'fixedLevels'
}

function assertTableBuilderAllowedKinds(config: TableBuilderHostConfig): void {
  if (config.allowedKinds.length === 0) {
    throw new Error('TableBuilderHostConfig.allowedKinds must be non-empty')
  }
}

function assertTableBuilderRecommendedKind(config: TableBuilderHostConfig): void {
  if (
    config.recommendedKind !== undefined &&
    !config.allowedKinds.includes(config.recommendedKind)
  ) {
    throw new Error(
      `TableBuilderHostConfig.recommendedKind "${config.recommendedKind}" is not in allowedKinds`,
    )
  }
}

function assertTableBuilderFixedStructure(config: TableBuilderHostConfig): void {
  if (config.columns === 'fixed' && (config.fixedColumns?.length ?? 0) === 0) {
    throw new Error('TableBuilderHostConfig.fixedColumns is required when columns is "fixed"')
  }
  if (config.rows === 'fixedLevels' && (config.allowedLevels?.length ?? 0) === 0) {
    throw new Error('TableBuilderHostConfig.allowedLevels is required when rows is "fixedLevels"')
  }
}

export function assertTableBuilderHostConfig(config: TableBuilderHostConfig): void {
  assertTableBuilderAllowedKinds(config)
  assertTableBuilderRecommendedKind(config)
  assertTableBuilderFixedStructure(config)
}
