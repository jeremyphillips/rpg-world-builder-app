/** Paths owned by the Building create Organizations tab (not Details). */
export function isOrgScopedBuildingCreatePath(path: string): boolean {
  return path === 'organizations' || path.startsWith('organizations.')
}

export function resolveBuildingCreateViewForPath(path: string): 'details' | 'organizations' {
  return isOrgScopedBuildingCreatePath(path) ? 'organizations' : 'details'
}
