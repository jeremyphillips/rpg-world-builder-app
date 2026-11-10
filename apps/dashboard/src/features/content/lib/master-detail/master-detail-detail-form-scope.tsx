'use client'

import { useMemo, type ReactNode } from 'react'
import { FormSectionContext, useFormSectionContext } from '@rpg/ui/form'

/** Minimum named-group depth for field groups inside a master-detail detail body. */
export const MASTER_DETAIL_DETAIL_NAMED_GROUP_DEPTH_FLOOR = 1

/**
 * Establishes subsection heading context for master-detail detail columns. Merges the
 * parent `FormSectionContext` and floors `namedGroupDepth` so shared builders resolve
 * subsection legends without per-feature `headingScale` overrides.
 */
export function MasterDetailDetailFormScope({ children }: { children: ReactNode }) {
  const parent = useFormSectionContext()
  const value = useMemo(() => {
    const namedGroupDepth = Math.max(
      parent.namedGroupDepth,
      MASTER_DETAIL_DETAIL_NAMED_GROUP_DEPTH_FLOOR,
    )
    const headingTier = namedGroupDepth === 0 ? ('section' as const) : ('subsection' as const)
    return {
      ...parent,
      namedGroupDepth,
      headingTier,
    }
  }, [parent])

  return <FormSectionContext.Provider value={value}>{children}</FormSectionContext.Provider>
}
