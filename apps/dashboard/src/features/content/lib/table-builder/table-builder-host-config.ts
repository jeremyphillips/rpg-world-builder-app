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
  /** Levels whose draft cells have been blurred — gates invalid/blocked editor state. */
  committedDraftLevels?: ReadonlySet<number>
  editorRowStates?: readonly TableBuilderHostEditorRowState[]
}

export type TableBuilderCommittedDraftLevelsContext = {
  draft: TableBuilderFormValues
  columnKey: string
  touchedFieldPaths: readonly string[]
}

export type TableBuilderCellPresentation = {
  /** Shown when the draft cell is blank. Never written into RHF. */
  placeholder?: string
  readOnly?: boolean
  /** Host-owned provenance chip rendered inside input chrome. */
  provenanceBadge?: 'derived'
  /** Potential validation message — generic cell decides visibility from RHF touch/submit. */
  progressionError?: string
  /** When true, scalar number cells use grouped thousand-separator formatting. */
  formatGrouped?: boolean
  /** Grouped display for filled draft values in preview surfaces. */
  formattedValue?: string
}

export type TableBuilderRowPresentationContext = {
  draft: TableBuilderFormValues
  rowIndex: number
  level?: number
  committedDraftLevels?: ReadonlySet<number>
  /** When provided, host resolvers skip recomputing editor row state per cell. */
  editorRowStates?: readonly TableBuilderHostEditorRowState[]
}

export type TableBuilderRowRestoreActionKind = 'system' | 'derived'

export type TableBuilderHostEditorRowState = {
  level: number
  readOnly?: boolean
  blockedByLevel?: number
  blockedHint?: string
  restoreActionKind?: TableBuilderRowRestoreActionKind
  progressionError?: string
  displayPlaceholder?: string
  provenanceBadge?: 'derived'
  formatGrouped?: boolean
}

export type TableBuilderRowPresentation = {
  readOnly?: boolean
  blockedByLevel?: number
  blockedHint?: string
}

export type TableBuilderRowRestoreAction = {
  kind: TableBuilderRowRestoreActionKind
  ariaLabel: string
  tooltip: string
}

export type TableBuilderExtendedProgressionAction = {
  label: 'Set extended progression'
  extendedStartsAt: number
  currentIncrement: number
  anchorLevel: number
  anchorXpRequired: number
  extendedEndLevel: number
}

export type TableBuilderDraftValidationResult =
  | { valid: true }
  | { valid: false; errors: Array<{ path: string; message: string }> }

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
export type TableBuilderFixedColumnDefinition = Pick<
  TableBuilderColumnDraft,
  'label' | 'valueType' | 'format'
> & {
  /** Stable semantic key reused when materializing draft columns (e.g. slot-level-3). */
  semanticKey?: string
}

export type TableBuilderHostConfig = {
  /** Non-empty — at least one kind must be allowed. */
  allowedKinds: readonly [TableBuilderKind, ...TableBuilderKind[]]
  /** Must be absent or a member of `allowedKinds`. */
  recommendedKind?: TableBuilderKind
  /** Semantic level set for the structural axis — progression tables only. */
  allowedLevels?: readonly number[]
  columns?: TableBuilderColumnsMode
  rows?: TableBuilderRowsMode
  fixedColumns?: readonly TableBuilderFixedColumnDefinition[]
  /** Data-derived fixed columns — takes precedence over {@link fixedColumns} when set. */
  resolveFixedColumns?: () => readonly TableBuilderFixedColumnDefinition[]
  resolveCommittedDraftLevels?: (
    ctx: TableBuilderCommittedDraftLevelsContext,
  ) => ReadonlySet<number> | undefined
  resolveEditorRowStates?: (ctx: {
    draft: TableBuilderFormValues
    committedDraftLevels?: ReadonlySet<number>
  }) => readonly TableBuilderHostEditorRowState[] | undefined
  resolveCellPresentation?: (
    ctx: TableBuilderCellPresentationContext,
  ) => TableBuilderCellPresentation | undefined
  resolveRowPresentation?: (
    ctx: TableBuilderRowPresentationContext,
  ) => TableBuilderRowPresentation | undefined
  resolveRowRestoreAction?: (
    ctx: TableBuilderRowPresentationContext,
  ) => TableBuilderRowRestoreAction | undefined
  resolveExtendedProgressionAction?: (ctx: {
    draft: TableBuilderFormValues
  }) => TableBuilderExtendedProgressionAction | undefined
  applyExtendedProgressionIncrement?: (ctx: {
    draft: TableBuilderFormValues
    increment: number
  }) => TableBuilderFormValues
  /** When true, fixed-level grids include a slim trailing restore column. */
  includeRowRestoreActions?: boolean
  resolveValuesNotice?: (ctx: {
    draft: TableBuilderFormValues
  }) => TableBuilderValuesNotice | undefined
  validateDraftBeforeSave?: (ctx: {
    draft: TableBuilderFormValues
  }) => TableBuilderDraftValidationResult
  /** When set on level-progression hosts, inserts a tier separator after standardMaxLevel. */
  extendedProgression?: TableBuilderExtendedProgression
  /** Host-owned add-row label — defaults to generic table-builder copy. */
  addRowLabel?: string
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

export function resolveTableBuilderFixedColumns(
  config: TableBuilderHostConfig,
): readonly TableBuilderFixedColumnDefinition[] {
  return config.resolveFixedColumns?.() ?? config.fixedColumns ?? []
}

function assertTableBuilderFixedStructure(config: TableBuilderHostConfig): void {
  if (config.columns === 'fixed' && resolveTableBuilderFixedColumns(config).length === 0) {
    throw new Error(
      'TableBuilderHostConfig.fixedColumns or resolveFixedColumns is required when columns is "fixed"',
    )
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
