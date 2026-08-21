'use client'

import * as React from 'react'
import { CatalogPickerSheet, type CatalogPickerCollapsibleRowRenderArgs } from '@rpg/ui'

type CatalogEntityPickerSheetBaseProps<TItem> = Omit<
  React.ComponentProps<typeof CatalogPickerSheet<TItem>>,
  | 'renderItemHeader'
  | 'renderCollapsibleRow'
  | 'rowLayout'
  | 'rowPreset'
  | 'rowSurface'
  | 'toolbarCompact'
>

export type CatalogEntityPickerSheetProps<TItem> = CatalogEntityPickerSheetBaseProps<TItem> & {
  renderEntityRow: (args: CatalogPickerCollapsibleRowRenderArgs<TItem>) => React.ReactNode
}

/** Mandatory entry point for entity-backed catalog pickers — wires catalog shell + entity row host. */
export function CatalogEntityPickerSheet<TItem>({
  renderEntityRow,
  ...props
}: CatalogEntityPickerSheetProps<TItem>) {
  return (
    <CatalogPickerSheet
      rowPreset="catalog"
      toolbarCompact
      {...props}
      renderCollapsibleRow={renderEntityRow}
    />
  )
}
