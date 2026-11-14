import { buildFieldRegistry, lookupRegistryEntry } from '../config/field-registry.lib'
import type { RegistryEntry } from '../config/field-error-map-register.lib'
import type { FormItem } from '../field-config'
import type { FormIssue } from './form-issue.types'

const ROOT_SUFFIX = '.root'

function ownerEntry(registry: Map<string, RegistryEntry>, path: string): RegistryEntry | undefined {
  return lookupRegistryEntry(registry, path, { mode: 'owner' })?.entry
}

function isMultiValueLeaf(entry: RegistryEntry | undefined): boolean {
  return entry?.category === 'multi'
}

/** Maps a resolver/RHF issue path to the canonical control path for presentation. */
export function resolveFormIssuePresentationPath(
  path: string,
  registry: Map<string, RegistryEntry>,
): string {
  if (path.endsWith(ROOT_SUFFIX)) {
    const leafPath = path.slice(0, -ROOT_SUFFIX.length)
    const entry = ownerEntry(registry, leafPath)
    if (isMultiValueLeaf(entry)) return leafPath
    return path
  }

  const indexMatch = path.match(/^(.*)\.(\d+)$/)
  if (indexMatch) {
    const [, parentPath] = indexMatch
    if (parentPath) {
      const entry = ownerEntry(registry, parentPath)
      if (isMultiValueLeaf(entry)) return parentPath
    }
  }

  return path
}

/** Adds {@link FormIssue.presentationPath} for badge, count, and aria-invalid matching. */
export function enrichFormIssuesWithPresentationPaths(
  issues: readonly FormIssue[],
  fields: FormItem[],
): FormIssue[] {
  const registry = buildFieldRegistry(fields)
  return issues.map((issue) => ({
    ...issue,
    presentationPath: resolveFormIssuePresentationPath(issue.path, registry),
  }))
}
