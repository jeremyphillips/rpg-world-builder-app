import { useContext, useEffect } from 'react'
import { BreadcrumbLabelContext } from './breadcrumb-label-context'

/** Read the current entity label registered by the active detail page. */
export function useBreadcrumbEntityLabel() {
  return useContext(BreadcrumbLabelContext).entityLabel
}

/**
 * Register a dynamic label for the current page's entity (e.g. class name,
 * spell name). Clears automatically when the component unmounts.
 *
 * Call this in the component that has the resolved entity data:
 * ```tsx
 * useSetBreadcrumbLabel(characterClass.name)
 * ```
 */
export function useSetBreadcrumbLabel(label: string | undefined) {
  const { setEntityLabel } = useContext(BreadcrumbLabelContext)
  useEffect(() => {
    setEntityLabel(label)
    return () => setEntityLabel(undefined)
  }, [label, setEntityLabel])
}
