import {
  CONTENT_TABLE_KINDS,
  type ContentTableKind,
  type GeneralTable,
  type ProgressionTable,
} from '@rpg/contracts'

export const TABLE_BUILDER_KINDS = CONTENT_TABLE_KINDS
export type TableBuilderKind = ContentTableKind

export type TableBuilderSavedTable = ProgressionTable | GeneralTable

export const tableBuilderCapabilities = {
  levelProgression: {
    axis: 'level',
    rowReorder: false,
    blankCellsCarryForward: true,
    defaultColumnValueType: 'number',
    rowHeaderLabel: 'Level',
  },
  general: {
    axis: 'authoredOrder',
    rowReorder: false,
    blankCellsCarryForward: false,
    defaultColumnValueType: 'text',
    rowHeaderLabel: undefined,
  },
} as const satisfies Record<
  TableBuilderKind,
  {
    axis: string
    rowReorder: boolean
    blankCellsCarryForward: boolean
    defaultColumnValueType: 'number' | 'dice' | 'text'
    rowHeaderLabel: string | undefined
  }
>
