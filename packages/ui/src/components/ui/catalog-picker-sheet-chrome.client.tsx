'use client'

import type { ReactNode } from 'react'

import { CatalogToolbar } from './catalog-toolbar.client'
import { CatalogPickerAuxiliaryActionSlot } from './catalog-picker-auxiliary-action.client'
import type { CatalogPickerAuxiliaryAction } from './catalog-picker-sheet.types'
import type { CatalogToolbarProps } from './catalog-toolbar.types'
import {
  catalogPickerHeaderChromeVariants,
  catalogPickerHeaderFilterClusterVariants,
  catalogPickerHeaderToolbarVariants,
  catalogPickerSheetBodyVariants,
} from './catalog-picker-sheet.variants'
import { Sheet } from './sheet.client'

type CatalogPickerSheetHeaderChromeProps = {
  pinChromeInHeader: boolean
  showPickerChrome: boolean
  headerExtra?: ReactNode
  headerBelowDescription?: ReactNode
  auxiliaryAction?: CatalogPickerAuxiliaryAction
  toolbarProps: Omit<CatalogToolbarProps, 'className'>
}

export function CatalogPickerSheetHeaderChrome({
  pinChromeInHeader,
  showPickerChrome,
  headerExtra,
  headerBelowDescription,
  auxiliaryAction,
  toolbarProps,
}: CatalogPickerSheetHeaderChromeProps) {
  if (pinChromeInHeader) {
    return (
      <div
        className={catalogPickerHeaderChromeVariants({
          ownsBottomPadding: !showPickerChrome,
        })}
      >
        {headerExtra}
        {headerBelowDescription}
        {showPickerChrome ? (
          <div className={catalogPickerHeaderFilterClusterVariants()}>
            <CatalogToolbar className={catalogPickerHeaderToolbarVariants()} {...toolbarProps} />
            {auxiliaryAction ? <CatalogPickerAuxiliaryActionSlot action={auxiliaryAction} /> : null}
          </div>
        ) : null}
      </div>
    )
  }

  if (headerExtra) {
    return <div className="mt-4">{headerExtra}</div>
  }

  return null
}

type CatalogPickerSheetScrollBodyProps = {
  bodyReplacement?: ReactNode
  pickerEnabled: boolean
  bodyContent: ReactNode
}

export function CatalogPickerSheetScrollBody({
  bodyReplacement,
  pickerEnabled,
  bodyContent,
}: CatalogPickerSheetScrollBodyProps) {
  if (bodyReplacement !== undefined) {
    return <Sheet.Body className={catalogPickerSheetBodyVariants()}>{bodyReplacement}</Sheet.Body>
  }

  if (!pickerEnabled) {
    return null
  }

  return <Sheet.Body className={catalogPickerSheetBodyVariants()}>{bodyContent}</Sheet.Body>
}
