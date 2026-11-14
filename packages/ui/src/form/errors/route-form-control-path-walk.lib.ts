import {
  isContainer,
  resolveFieldConfigBoundNames,
  type FormItem,
  type RowConfig,
  type SlotConfig,
} from '../field-config'
import { resolveColumnsCollapseSequence } from '../config/form-columns-collapse.lib'
import type { FieldConfig } from '../field-config'
import { isFieldPathEligibleForPresentation } from './resolve-field-error-presentation.lib'

export type ControlPathWalkAccumulators = {
  paths: string[]
  slotPaths: Set<string>
  slotOwnerships: Array<{ slotPath: string; issuePaths: readonly string[] }>
}

type WalkParams = ControlPathWalkAccumulators & {
  inactivePaths: ReadonlySet<string>
  formValues: Record<string, unknown>
}

function joinPath(prefix: string, name: string): string {
  return prefix ? `${prefix}.${name}` : name
}

export function readValueAt(values: Record<string, unknown>, path: string): unknown {
  const segments = path.split('.').filter(Boolean)
  let cursor: unknown = values
  for (const segment of segments) {
    if (typeof cursor !== 'object' || cursor === null) return undefined
    cursor = (cursor as Record<string, unknown>)[segment]
  }
  return cursor
}

function appendBoundControlPaths(
  field: FieldConfig,
  absolutePrefix: string,
  paths: string[],
  inactivePaths: ReadonlySet<string>,
): void {
  for (const bound of resolveFieldConfigBoundNames(field)) {
    const fullPath = joinPath(absolutePrefix, bound)
    if (isFieldPathEligibleForPresentation(fullPath, inactivePaths)) {
      paths.push(fullPath)
    }
  }
}

function registerSlotPath(
  slot: Pick<SlotConfig, 'name' | 'issuePaths'>,
  absolutePrefix: string,
  accumulators: ControlPathWalkAccumulators,
  inactivePaths: ReadonlySet<string>,
): void {
  const slotPath = joinPath(absolutePrefix, slot.name)
  if (isFieldPathEligibleForPresentation(slotPath, inactivePaths)) {
    accumulators.paths.push(slotPath)
    accumulators.slotPaths.add(slotPath)
  }
  if (slot.issuePaths?.length) {
    accumulators.slotOwnerships.push({
      slotPath,
      issuePaths: slot.issuePaths.map((issuePath) => joinPath(absolutePrefix, issuePath)),
    })
  }
}

function walkArrayItems(
  item: Extract<FormItem, { kind: 'array' }>,
  absolutePrefix: string,
  params: WalkParams,
): void {
  const arrayPath = joinPath(absolutePrefix, item.name)
  if (isFieldPathEligibleForPresentation(arrayPath, params.inactivePaths)) {
    params.paths.push(arrayPath)
  }

  const arrayItems = readValueAt(params.formValues, arrayPath)
  const itemPrefixes =
    Array.isArray(arrayItems) && arrayItems.length > 0
      ? arrayItems.map((_, index) => `${arrayPath}.${index}`)
      : [`${arrayPath}.0`]

  for (const itemPrefix of itemPrefixes) {
    walkOrderedControlPaths(item.fields, itemPrefix, params)
  }
}

function walkContainerItem(item: FormItem, absolutePrefix: string, params: WalkParams): void {
  switch (item.kind) {
    case 'slot':
      registerSlotPath(item, absolutePrefix, params, params.inactivePaths)
      return
    case 'dependent':
      walkOrderedControlPaths([item.controller, ...item.dependents.fields], absolutePrefix, params)
      return
    case 'columns':
      walkOrderedControlPaths(
        resolveColumnsCollapseSequence(item.columns, item.collapseOrder),
        absolutePrefix,
        params,
      )
      return
    case 'row':
      for (const field of item.fields) {
        if ('kind' in field && field.kind === 'slot') {
          registerSlotPath(field, absolutePrefix, params, params.inactivePaths)
        } else {
          appendBoundControlPaths(
            field as FieldConfig,
            absolutePrefix,
            params.paths,
            params.inactivePaths,
          )
        }
      }
      return
    case 'array':
      walkArrayItems(item, absolutePrefix, params)
      return
    case 'group':
      walkOrderedControlPaths(item.fields, absolutePrefix, params)
      return
    default:
      return
  }
}

export function walkOrderedControlPaths(
  items: Array<FormItem | RowConfig>,
  absolutePrefix: string,
  params: WalkParams,
): void {
  for (const item of items) {
    if (!isContainer(item)) {
      appendBoundControlPaths(
        item as FieldConfig,
        absolutePrefix,
        params.paths,
        params.inactivePaths,
      )
      continue
    }
    walkContainerItem(item, absolutePrefix, params)
  }
}
