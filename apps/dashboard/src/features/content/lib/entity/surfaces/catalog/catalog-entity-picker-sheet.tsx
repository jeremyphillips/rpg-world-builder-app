import * as React from 'react'
import {
  CatalogPickerSheet,
  type CatalogPickerCollapsibleRowRenderArgs,
  type CatalogPickerSearchStrategy,
  type CatalogPickerSheetProps,
} from '@rpg/ui'

type CatalogEntityPickerSheetBaseProps<TItem> = Omit<
  CatalogPickerSheetProps<TItem>,
  | 'renderItemHeader'
  | 'renderCollapsibleRow'
  | 'rowLayout'
  | 'rowPreset'
  | 'rowSurface'
  | 'toolbarCompact'
  | 'headlineClassName'
  | 'rowBodyClassName'
  | 'rowShellClassName'
>

export type CatalogEntityPickerSheetProps<TItem> = CatalogEntityPickerSheetBaseProps<TItem> &
  CatalogPickerSearchStrategy<TItem> & {
    renderEntityRow: (args: CatalogPickerCollapsibleRowRenderArgs<TItem>) => React.ReactNode
  }

/** Mandatory entry point for entity-backed catalog pickers — wires catalog shell + entity row host. */
export function CatalogEntityPickerSheet<TItem>({
  renderEntityRow,
  ...props
}: CatalogEntityPickerSheetProps<TItem>) {
  const sheetProps = {
    rowPreset: 'catalog',
    toolbarCompact: true,
    ...props,
    renderCollapsibleRow: renderEntityRow,
  } as CatalogPickerSheetProps<TItem>

  return <CatalogPickerSheet {...sheetProps} />
}
