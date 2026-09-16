import { buildFieldRegistry } from '../config/field-error-map'
import type { RegistryEntry } from '../config/field-error-map-register.lib'
import type { FormItem } from '../field-config'
import type { FormIssue } from './form-issue.types'

const ROOT_SUFFIX = '.root'

function normalizeRegistryPath(path: string): string {
  return path
    .split('.')
    .map((segment) => (/^\d+$/.test(segment) ? '*' : segment))
    .join('.')
}

function lookupRegistryEntry(
  registry: Map<string, RegistryEntry>,
  path: string,
): RegistryEntry | undefined {
  const segments = path.split('.')

  for (let length = segments.length; length > 0; length -= 1) {
    const key = segments
      .slice(0, length)
      .map((segment) => (/^\d+$/.test(segment) ? '*' : segment))
      .join('.')
    const entry = registry.get(key)
    if (entry) return entry
  }

  return undefined
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
    const entry = lookupRegistryEntry(registry, normalizeRegistryPath(leafPath))
    if (isMultiValueLeaf(entry)) return leafPath
    return path
  }

  const indexMatch = path.match(/^(.*)\.(\d+)$/)
  if (indexMatch) {
    const [, parentPath] = indexMatch
    if (parentPath) {
      const entry = lookupRegistryEntry(registry, normalizeRegistryPath(parentPath))
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
