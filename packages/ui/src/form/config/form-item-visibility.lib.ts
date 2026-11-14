import {
  isFieldVisible,
  resolveDependentsVisibility,
  resolveFieldConfigBoundNames,
  type FieldConfig,
  type FormItem,
  type RowConfig,
} from '../field-config'
import { resolveColumnsCollapseSequence } from './form-columns-collapse.lib'

export type FormContainerItem = Extract<
  FormItem,
  { kind: 'group' | 'row' | 'columns' | 'dependent' }
>

/** Matches container gating used by conditional row/group/columns/dependent sections. */
export function isFormContainerVisible(
  item: FormContainerItem,
  values: Record<string, unknown>,
): boolean {
  if (item.kind === 'dependent' && !isFieldVisible(item.controller, values)) {
    return false
  }
  return item.visibility ? item.visibility.visibleWhen(values) : true
}

export function formContainerChildItems(
  item: Extract<FormItem, { kind: 'group' | 'row' | 'columns' }>,
): FormItem[] {
  if (item.kind === 'columns') {
    return resolveColumnsCollapseSequence(item.columns, item.collapseOrder)
  }
  return item.fields as FormItem[]
}

function collectAllBoundNames(items: readonly (FormItem | RowConfig)[]): string[] {
  const names: string[] = []

  for (const item of items) {
    if (!('kind' in item)) {
      names.push(...resolveFieldConfigBoundNames(item))
      continue
    }

    switch (item.kind) {
      case 'group':
      case 'row':
      case 'columns':
        names.push(...collectAllBoundNames(formContainerChildItems(item)))
        break
      case 'dependent':
        names.push(...resolveFieldConfigBoundNames(item.controller))
        names.push(...collectAllBoundNames(item.dependents.fields as FormItem[]))
        break
      default:
        break
    }
  }

  return names
}

/** Hidden RHF paths under the item, honoring ancestor and dependent gating. */
export function collectHiddenFormItemBoundNames(
  items: readonly (FormItem | RowConfig)[],
  values: Record<string, unknown>,
): string[] {
  const hidden: string[] = []

  for (const item of items) {
    if (!('kind' in item)) {
      if (!isFieldVisible(item, values)) {
        hidden.push(...resolveFieldConfigBoundNames(item))
      }
      continue
    }

    switch (item.kind) {
      case 'group':
      case 'row':
      case 'columns': {
        const children = formContainerChildItems(item)
        if (!isFormContainerVisible(item, values)) {
          hidden.push(...collectAllBoundNames(children))
          break
        }
        hidden.push(...collectHiddenFormItemBoundNames(children, values))
        break
      }
      case 'dependent': {
        if (!isFormContainerVisible(item, values)) {
          hidden.push(...resolveFieldConfigBoundNames(item.controller))
          hidden.push(...collectAllBoundNames(item.dependents.fields as FormItem[]))
          break
        }
        if (!isFieldVisible(item.controller, values)) {
          hidden.push(...resolveFieldConfigBoundNames(item.controller))
        }
        hidden.push(...collectHiddenDependentFieldBoundNames(item, item.controller, values))
        break
      }
      default:
        break
    }
  }

  return hidden
}

function collectHiddenDependentFieldBoundNames(
  item: Extract<FormItem, { kind: 'dependent' }>,
  controller: FieldConfig,
  values: Record<string, unknown>,
): string[] {
  const dependentsVisibility = resolveDependentsVisibility(item, controller)
  if (dependentsVisibility && !dependentsVisibility.visibleWhen(values)) {
    return collectAllBoundNames(item.dependents.fields as FormItem[])
  }
  return collectHiddenFormItemBoundNames(item.dependents.fields as FormItem[], values)
}

function formContainerHasVisibleRenderableFields(
  item: Extract<FormItem, { kind: 'group' | 'row' | 'columns' }>,
  values: Record<string, unknown>,
): boolean {
  if (!isFormContainerVisible(item, values)) return false
  return formItemsHaveVisibleRenderableFields(formContainerChildItems(item), values)
}

function formDependentHasVisibleRenderableFields(
  item: Extract<FormItem, { kind: 'dependent' }>,
  values: Record<string, unknown>,
): boolean {
  if (!isFormContainerVisible(item, values)) return false
  if (isFieldVisible(item.controller, values)) return true
  const dependentsVisibility = resolveDependentsVisibility(item, item.controller)
  if (dependentsVisibility && !dependentsVisibility.visibleWhen(values)) {
    return false
  }
  return formItemsHaveVisibleRenderableFields(item.dependents.fields as FormItem[], values)
}

function formItemHasVisibleRenderableField(
  item: FormItem | RowConfig,
  values: Record<string, unknown>,
): boolean {
  if (!('kind' in item)) {
    return isFieldVisible(item, values)
  }

  switch (item.kind) {
    case 'group':
    case 'row':
    case 'columns':
      return formContainerHasVisibleRenderableFields(item, values)
    case 'dependent':
      return formDependentHasVisibleRenderableFields(item, values)
    case 'slot':
      return item.visibility ? item.visibility.visibleWhen(values) : true
    case 'array':
      return item.visibility ? item.visibility.visibleWhen(values) : true
    default:
      return false
  }
}

/** Whether any nested field would mount for the current values — mirrors FormItemNode gating. */
export function formItemsHaveVisibleRenderableFields(
  items: readonly (FormItem | RowConfig)[],
  values: Record<string, unknown>,
): boolean {
  return items.some((item) => formItemHasVisibleRenderableField(item, values))
}
