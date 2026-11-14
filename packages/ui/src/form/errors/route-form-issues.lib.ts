import { lookupRegistryEntry } from '../config/field-registry.lib'
import { buildFieldRegistry } from '../config/field-error-map'
import type { RegistryEntry } from '../config/field-error-map-register.lib'
import type { FormItem } from '../field-config'
import type { FormIssue, FormIssueClaim, FormIssueClaimKind } from './form-issue.types'
import { parseArrayItemContext } from './flatten-form-issues'
import {
  collectInactiveFieldPaths,
  isFieldPathEligibleForPresentation,
} from './resolve-field-error-presentation.lib'
import { resolveFormIssuePresentationPath } from './resolve-form-issue-presentation-path.lib'
import { prefixFormItems } from '../config/prefix-form-items.lib'
import {
  readValueAt,
  walkOrderedControlPaths,
  type ControlPathWalkAccumulators,
} from './route-form-control-path-walk.lib'

const FORM_ISSUE_ROUTING_LOG = '[form-issue-routing] non-control claim'

export type RouteFormIssuesOptions = {
  /**
   * When set, `fields` use relative names and are registered under this prefix.
   * Visibility and inactive paths read values from this nested subtree.
   */
  fieldPathPrefix?: string
}

type RouteFormIssuesContext = {
  registry: Map<string, RegistryEntry>
  orderedControlPaths: string[]
  slotPaths: Set<string>
  slotOwnerships: Array<{ slotPath: string; issuePaths: readonly string[] }>
  inactivePaths: ReadonlySet<string>
}

function registryEntryAt(registry: Map<string, RegistryEntry>, path: string) {
  return lookupRegistryEntry(registry, path, { mode: 'exact' })
}

function canClaimEntry(
  entry: RegistryEntry,
  mode: 'exact' | 'ancestor',
  issuePath: string,
  entryPath: string,
): boolean {
  if (entry.labelOnly || entry.role === 'hostSlot') return false
  if (entry.role === 'array') return mode === 'exact' && issuePath === entryPath
  return entry.role === 'control' || entry.role === 'slotOwner'
}

function pathOwnsIssuePath(ownerPath: string, issuePath: string): boolean {
  return issuePath === ownerPath || issuePath.startsWith(`${ownerPath}.`)
}

function resolveScopedInactivePaths(
  fields: FormItem[],
  formValues: Record<string, unknown>,
  fieldPathPrefix: string | undefined,
): ReadonlySet<string> {
  const visibilityValues = fieldPathPrefix
    ? ((readValueAt(formValues, fieldPathPrefix) as Record<string, unknown>) ?? {})
    : formValues
  const relativeInactive = collectInactiveFieldPaths(fields, visibilityValues)
  if (!fieldPathPrefix) return relativeInactive

  return new Set(
    [...relativeInactive].map((path) => (path ? `${fieldPathPrefix}.${path}` : fieldPathPrefix)),
  )
}

function buildRouteContext(
  fields: FormItem[],
  formValues: Record<string, unknown>,
  options?: RouteFormIssuesOptions,
): RouteFormIssuesContext {
  const fieldPathPrefix = options?.fieldPathPrefix
  const absoluteFields = fieldPathPrefix ? prefixFormItems(fields, fieldPathPrefix) : fields
  const registry = buildFieldRegistry(absoluteFields, formValues)
  const inactivePaths = resolveScopedInactivePaths(fields, formValues, fieldPathPrefix)
  const orderedControlPaths: string[] = []
  const slotPaths = new Set<string>()
  const slotOwnerships: RouteFormIssuesContext['slotOwnerships'] = []

  const accumulators: ControlPathWalkAccumulators = {
    paths: orderedControlPaths,
    slotPaths,
    slotOwnerships,
  }
  walkOrderedControlPaths(absoluteFields, '', {
    ...accumulators,
    inactivePaths,
    formValues,
  })

  return { registry, orderedControlPaths, slotPaths, slotOwnerships, inactivePaths }
}

function claimKindForEntry(
  path: string,
  entry: RegistryEntry,
  slotPaths: Set<string>,
): FormIssueClaimKind {
  if (entry.role === 'slotOwner' || (entry.role !== 'array' && slotPaths.has(path))) return 'slot'
  return 'field'
}

function buildClaim(path: string, kind: FormIssueClaimKind): FormIssueClaim {
  return { kind, target: path }
}

function findSlotOwnershipClaim(
  path: string,
  slotOwnerships: RouteFormIssuesContext['slotOwnerships'],
): FormIssueClaim | undefined {
  for (const ownership of slotOwnerships) {
    for (const issuePath of ownership.issuePaths) {
      if (pathOwnsIssuePath(issuePath, path) || path === issuePath) {
        return buildClaim(ownership.slotPath, 'slot')
      }
    }
  }
  return undefined
}

function findExactControlClaim(
  path: string,
  context: RouteFormIssuesContext,
): FormIssueClaim | undefined {
  if (!isFieldPathEligibleForPresentation(path, context.inactivePaths)) return undefined
  const match = registryEntryAt(context.registry, path)
  if (!match || !canClaimEntry(match.entry, 'exact', path, match.path)) return undefined
  return buildClaim(path, claimKindForEntry(path, match.entry, context.slotPaths))
}

function findAncestorControlClaim(
  path: string,
  context: RouteFormIssuesContext,
): FormIssueClaim | undefined {
  const segments = path.split('.').filter(Boolean)
  for (let length = segments.length - 1; length > 0; length -= 1) {
    const candidate = segments.slice(0, length).join('.')
    if (!isFieldPathEligibleForPresentation(candidate, context.inactivePaths)) continue
    const match = registryEntryAt(context.registry, candidate)
    if (!match || !canClaimEntry(match.entry, 'ancestor', candidate, match.path)) continue
    return buildClaim(candidate, claimKindForEntry(candidate, match.entry, context.slotPaths))
  }
  return undefined
}

function findDescendantControlClaim(
  path: string,
  context: RouteFormIssuesContext,
): FormIssueClaim | undefined {
  const descendant = context.orderedControlPaths.find((controlPath) => {
    if (!controlPath.startsWith(`${path}.`) || controlPath === path) return false
    const match = registryEntryAt(context.registry, controlPath)
    return match !== undefined && canClaimEntry(match.entry, 'ancestor', controlPath, match.path)
  })
  if (!descendant) return undefined
  const match = registryEntryAt(context.registry, descendant)
  if (!match) return undefined
  return buildClaim(descendant, claimKindForEntry(descendant, match.entry, context.slotPaths))
}

function findRowClaim(issue: FormIssue): FormIssueClaim | undefined {
  if (issue.itemPrefix) {
    return buildClaim(issue.itemPrefix, 'row')
  }

  const segments = issue.path.split('.').filter(Boolean)
  for (let index = 0; index < segments.length - 1; index += 1) {
    const next = segments[index + 1]
    if (!next || !/^\d+$/.test(next)) continue
    const itemPrefix = `${segments.slice(0, index + 1).join('.')}.${next}`
    return buildClaim(itemPrefix, 'row')
  }

  return undefined
}

function resolveFallbackClaim(issue: FormIssue): FormIssueClaim {
  const rowClaim = findRowClaim(issue)
  if (rowClaim) return rowClaim
  return buildClaim('form', 'form')
}

function logNonControlClaim(
  issue: FormIssue,
  claim: FormIssueClaim,
  context: RouteFormIssuesContext,
): void {
  if (issue.severity !== 'field') return
  if (claim.kind !== 'row' && claim.kind !== 'form' && claim.kind !== 'fallback') return
  if (!isFieldPathEligibleForPresentation(issue.path, context.inactivePaths)) return
  const match = registryEntryAt(context.registry, issue.path)
  if (!match || !canClaimEntry(match.entry, 'exact', issue.path, match.path)) return
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') return
  console.error(FORM_ISSUE_ROUTING_LOG, issue.path)
}

function routeSingleIssue(issue: FormIssue, context: RouteFormIssuesContext): FormIssue {
  const enriched: FormIssue = {
    ...issue,
    ...parseArrayItemContext(issue.path),
  }

  const claim =
    findExactControlClaim(enriched.path, context) ??
    findSlotOwnershipClaim(enriched.path, context.slotOwnerships) ??
    findAncestorControlClaim(enriched.path, context) ??
    findDescendantControlClaim(enriched.path, context) ??
    resolveFallbackClaim(enriched)

  const presentationPath =
    claim.kind === 'field' || claim.kind === 'slot'
      ? resolveFormIssuePresentationPath(claim.target, context.registry)
      : claim.kind === 'row'
        ? claim.target
        : resolveFormIssuePresentationPath(enriched.path, context.registry)

  logNonControlClaim(enriched, claim, context)

  return {
    ...enriched,
    claim,
    presentationPath,
  }
}

/** Routes each issue to a field, slot, row, or summary target; sets {@link FormIssue.presentationPath}. */
export function routeFormIssues(
  issues: readonly FormIssue[],
  fields: FormItem[],
  formValues: Record<string, unknown> = {},
  options?: RouteFormIssuesOptions,
): FormIssue[] {
  if (issues.length === 0) return []
  const context = buildRouteContext(fields, formValues, options)
  return issues.map((issue) => routeSingleIssue(issue, context))
}

export const FORM_ISSUE_ROUTING_FALLBACK_LOG = FORM_ISSUE_ROUTING_LOG
