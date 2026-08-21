import { useMatches, type UIMatch } from 'react-router-dom'

import { hasBreadcrumbMode, hasCrumb, type BreadcrumbData, type CrumbItem } from '@/app/breadcrumbs'

import { useBreadcrumbEntityLabel } from './use-breadcrumb-label'

function resolveBreadcrumbMode(matches: UIMatch[]): BreadcrumbData['breadcrumbMode'] {
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const handle = matches[index]?.handle
    if (hasBreadcrumbMode(handle)) {
      return 'edit'
    }
  }

  return undefined
}

function resolveIsCollectionIndex(matches: UIMatch[]): boolean {
  const leaf = matches.at(-1)
  if (!leaf || hasCrumb(leaf.handle)) {
    return false
  }

  for (let index = matches.length - 2; index >= 0; index -= 1) {
    const match = matches[index]
    if (match && hasCrumb(match.handle)) {
      const leafSegments = leaf.pathname.split('/').filter(Boolean)
      const parentSegments = match.pathname.split('/').filter(Boolean)
      return leafSegments.length === parentSegments.length
    }
  }

  return false
}

/** Resolves breadcrumb items from the active route matches and page label context. */
export function useResolvedBreadcrumbs(): CrumbItem[] {
  const matches = useMatches()
  const entityLabel = useBreadcrumbEntityLabel()

  const data: BreadcrumbData = {
    entityLabel,
    breadcrumbMode: resolveBreadcrumbMode(matches),
    isCollectionIndex: resolveIsCollectionIndex(matches),
  }

  return matches
    .filter((match) => hasCrumb(match.handle))
    .map((match) => hasCrumb(match.handle) && match.handle.crumb(match.params, data))
    .filter((crumb): crumb is CrumbItem => Boolean(crumb))
}
