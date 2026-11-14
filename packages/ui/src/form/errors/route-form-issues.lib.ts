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

const FORM_ISSUE_ROUTING_LOG = '[form-issue-routing] fallback claim'

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

function normalizeRegistryKey(path: string): string {
  return path
    .split('.')
    .map((segment) => (/^\d+$/.test(segment) ? '*' : segment))
    .join('.')
}

function registryEntryAt(
  registry: Map<string, RegistryEntry>,
  path: string,
): { key: string; entry: RegistryEntry } | undefined {
  const segments = path.split('.')
  for (let length = segments.length; length > 0; length -= 1) {
    const key = normalizeRegistryKey(segments.slice(0, length).join('.'))
    const entry = registry.get(key)
    if (!entry) continue
    if (entry.exactPath && length !== segments.length) continue
    return { key, entry }
  }
  return undefined
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
  const registry = buildFieldRegistry(absoluteFields)
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

function claimKindForControl(path: string, slotPaths: Set<string>): FormIssueClaimKind {
  return slotPaths.has(path) ? 'slot' : 'field'
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
  if (!registryEntryAt(context.registry, path)) return undefined
  return buildClaim(path, claimKindForControl(path, context.slotPaths))
}

function findAncestorControlClaim(
  path: string,
  context: RouteFormIssuesContext,
): FormIssueClaim | undefined {
  const segments = path.split('.').filter(Boolean)
  for (let length = segments.length - 1; length > 0; length -= 1) {
    const candidate = segments.slice(0, length).join('.')
    if (!isFieldPathEligibleForPresentation(candidate, context.inactivePaths)) continue
    if (!registryEntryAt(context.registry, candidate)) continue
    return buildClaim(candidate, claimKindForControl(candidate, context.slotPaths))
  }
  return undefined
}

function findDescendantControlClaim(
  path: string,
  context: RouteFormIssuesContext,
): FormIssueClaim | undefined {
  const descendant = context.orderedControlPaths.find(
    (controlPath) => controlPath.startsWith(`${path}.`) && controlPath !== path,
  )
  if (!descendant) return undefined
  return buildClaim(descendant, claimKindForControl(descendant, context.slotPaths))
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
  return buildClaim('form', 'fallback')
}

function logFallbackClaim(issue: FormIssue, claim: FormIssueClaim): void {
  if (claim.kind !== 'fallback') return
  if (issue.severity !== 'field') return
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

  logFallbackClaim(enriched, claim)

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
