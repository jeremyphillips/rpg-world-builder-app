import { useLayoutEffect, useRef, useState } from 'react'

import { areStatRowGroupsSideBySide } from './are-stat-row-groups-side-by-side.lib'
import { measureStatRowLabelColumnWidths } from './measure-stat-row-label-column-widths.lib'

export type ContentDetailStatRowGroupLayoutState = {
  trailingDividerAfterGroup: boolean[]
  /** Shared across every group so stacked blocks keep one key column. */
  labelColumnWidthPx: number | undefined
}

const EMPTY_LAYOUT: ContentDetailStatRowGroupLayoutState = {
  trailingDividerAfterGroup: [],
  labelColumnWidthPx: undefined,
}

function labelColumnWidthsEqual(left: number | undefined, right: number | undefined): boolean {
  if (left === undefined || right === undefined) {
    return left === right
  }
  return Math.abs(left - right) < 1
}

function trailingDividersEqual(left: boolean[], right: boolean[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

function readGroupLayoutBoxes(groupCount: number, groupRefs: readonly (HTMLDivElement | null)[]) {
  return Array.from({ length: groupCount }, (_, index) => {
    const element = groupRefs[index]
    if (!element) {
      return { offsetTop: 0, offsetLeft: 0, offsetWidth: 0 }
    }
    return {
      offsetTop: element.offsetTop,
      offsetLeft: element.offsetLeft,
      offsetWidth: element.offsetWidth,
    }
  })
}

export function useContentDetailStatRowGroupLayout(groupCount: number) {
  const hostRef = useRef<HTMLDivElement>(null)
  const groupRefs = useRef<(HTMLDivElement | null)[]>([])

  const [layout, setLayout] = useState<ContentDetailStatRowGroupLayoutState>(EMPTY_LAYOUT)

  useLayoutEffect(() => {
    if (groupCount <= 0) {
      return
    }

    const measure = () => {
      const boxes = readGroupLayoutBoxes(groupCount, groupRefs.current)
      const trailingDividerAfterGroup = groupCount > 1 ? areStatRowGroupsSideBySide(boxes) : []
      const labelColumnWidthPx =
        groupCount > 1 ? measureStatRowLabelColumnWidths(groupRefs.current) : undefined

      setLayout((previous) => {
        if (
          trailingDividersEqual(previous.trailingDividerAfterGroup, trailingDividerAfterGroup) &&
          labelColumnWidthsEqual(previous.labelColumnWidthPx, labelColumnWidthPx)
        ) {
          return previous
        }
        return { trailingDividerAfterGroup, labelColumnWidthPx }
      })
    }

    measure()

    const host = hostRef.current
    if (!host || typeof ResizeObserver === 'undefined') {
      return
    }

    let frame = 0
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    const resizeObserver = new ResizeObserver(schedule)
    resizeObserver.observe(host)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
    }
  }, [groupCount])

  const setGroupRef = (index: number) => (node: HTMLDivElement | null) => {
    groupRefs.current[index] = node
  }

  return {
    hostRef,
    setGroupRef,
    layout: groupCount <= 0 ? EMPTY_LAYOUT : layout,
  }
}
