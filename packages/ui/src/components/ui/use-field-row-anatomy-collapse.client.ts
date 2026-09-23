'use client'

import * as React from 'react'

/** Observes anatomy-row width and toggles collapse when below the token-derived minimum. */
export function useFieldRowAnatomyCollapse(collapseMinWidth: number) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    if (!element || collapseMinWidth <= 0) {
      setCollapsed(false)
      return
    }

    const update = () => {
      setCollapsed(element.getBoundingClientRect().width < collapseMinWidth)
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [collapseMinWidth])

  return {
    ref,
    'data-field-row-collapsed': collapsed ? '' : undefined,
  }
}
