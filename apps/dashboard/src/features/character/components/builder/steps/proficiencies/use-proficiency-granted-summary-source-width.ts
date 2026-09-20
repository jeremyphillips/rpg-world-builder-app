import { useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'

import type { GrantedProficiencySummaryRow } from '@rpg/contracts'

import {
  collectProficiencyGrantedSummarySourceLabels,
  measureMaxElementWidth,
  PROFICIENCY_GRANTED_SUMMARY_SOURCE_WIDTH_VAR,
} from './proficiency-granted-summary-source-width.lib'
import { proficiencyGrantedSummarySourceLabelClasses } from './proficiency-granted-summary.variants'

export function useProficiencyGrantedSummarySourceWidth(
  rows: readonly GrantedProficiencySummaryRow[],
): {
  sourceWidthStyle: Record<string, string> | undefined
  measureLabels: readonly string[]
  measureRef: RefObject<HTMLDivElement | null>
} {
  const measureRef = useRef<HTMLDivElement>(null)
  const [sourceColumnWidthPx, setSourceColumnWidthPx] = useState<number | undefined>()

  const measureLabels = useMemo(() => collectProficiencyGrantedSummarySourceLabels(rows), [rows])

  useLayoutEffect(() => {
    const measureContainer = measureRef.current
    if (!measureContainer || measureLabels.length === 0) {
      setSourceColumnWidthPx(undefined)
      return
    }

    const labelElements = [
      ...measureContainer.querySelectorAll<HTMLElement>('[data-source-measure]'),
    ]
    setSourceColumnWidthPx(measureMaxElementWidth(labelElements))
  }, [measureLabels])

  const sourceWidthStyle =
    sourceColumnWidthPx !== undefined
      ? { [PROFICIENCY_GRANTED_SUMMARY_SOURCE_WIDTH_VAR]: `${Math.ceil(sourceColumnWidthPx)}px` }
      : undefined

  return {
    sourceWidthStyle,
    measureLabels,
    measureRef,
  }
}

export { proficiencyGrantedSummarySourceLabelClasses as sourceMeasureLabelClasses }
