import { useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'

import type { GrantedProficiencySummaryRow } from '@rpg/contracts'

import {
  BUILDER_FACT_SUMMARY_SOURCE_WIDTH_VAR,
  collectBuilderFactSummarySourceLabels,
  measureMaxElementWidth,
} from './builder-fact-summary-source-width.lib'
import { builderFactSummarySourceLabelClasses } from './builder-fact-summary.variants'

export function useBuilderFactSummarySourceWidth(rows: readonly GrantedProficiencySummaryRow[]): {
  sourceWidthStyle: Record<string, string> | undefined
  measureLabels: readonly string[]
  measureRef: RefObject<HTMLDivElement | null>
} {
  const measureRef = useRef<HTMLDivElement>(null)
  const [sourceColumnWidthPx, setSourceColumnWidthPx] = useState<number | undefined>()

  const measureLabels = useMemo(() => collectBuilderFactSummarySourceLabels(rows), [rows])

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
      ? { [BUILDER_FACT_SUMMARY_SOURCE_WIDTH_VAR]: `${Math.ceil(sourceColumnWidthPx)}px` }
      : undefined

  return {
    sourceWidthStyle,
    measureLabels,
    measureRef,
  }
}

export { builderFactSummarySourceLabelClasses as sourceMeasureLabelClasses }
