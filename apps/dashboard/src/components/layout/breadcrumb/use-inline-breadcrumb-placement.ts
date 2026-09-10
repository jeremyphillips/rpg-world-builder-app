import { useMatches } from 'react-router-dom'

import { hasInlineBreadcrumbPlacement } from '@/app/breadcrumbs'

/** True when the active route tree opts into form-column breadcrumbs instead of the shell rail. */
export function useInlineBreadcrumbPlacement(): boolean {
  const matches = useMatches()

  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const handle = matches[index]?.handle
    if (hasInlineBreadcrumbPlacement(handle)) {
      return true
    }
  }

  return false
}
