import type {
  ArrayAddActionConfig,
  ArrayConfig,
  ColumnsConfig,
  FormItem,
  GroupConfig,
  RowConfig,
} from '../../field-config'

export type RelationshipArrayBinding = {
  /** Stable RHF path. Example: `organizations`, `connections.locations`. */
  fieldPath: string
  vocabulary: string
  cardinality: 'one' | 'many'
}

type ContainerItem = GroupConfig | RowConfig | ColumnsConfig

function resolveRelationshipAddAction(
  addAction: ArrayConfig['addAction'],
): ArrayAddActionConfig['relationship'] | undefined {
  if (!addAction || typeof addAction !== 'object') return undefined
  return addAction.relationship
}

function warnNestedRelationshipArray(name: string, parentPath: string): void {
  if (process.env.NODE_ENV === 'production') return
  console.warn(
    `[Form] Array "${name}" under "${parentPath}" declares addAction.relationship but nested array-item paths are index-relative — relationship picker wiring is skipped.`,
  )
}

function resolveArrayFieldPath(pathPrefix: string | undefined, name: string): string {
  return pathPrefix ? `${pathPrefix}.${name}` : name
}

function pushRelationshipBinding(
  item: ArrayConfig,
  fieldPath: string,
  pathPrefix: string | undefined,
  insideArrayItem: boolean,
  bindings: RelationshipArrayBinding[],
): void {
  const relationship = resolveRelationshipAddAction(item.addAction)
  if (!relationship) return

  if (insideArrayItem) {
    warnNestedRelationshipArray(item.name, pathPrefix ?? 'array item')
    return
  }

  bindings.push({
    fieldPath,
    vocabulary: relationship.vocabulary,
    cardinality: relationship.cardinality ?? 'many',
  })
}

function walkContainerFields(
  fields: readonly (FormItem | RowConfig)[],
  pathPrefix: string | undefined,
  insideArrayItem: boolean,
  bindings: RelationshipArrayBinding[],
): void {
  walkItems(fields, pathPrefix, insideArrayItem, bindings)
}

function walkArrayItem(
  item: ArrayConfig,
  pathPrefix: string | undefined,
  insideArrayItem: boolean,
  bindings: RelationshipArrayBinding[],
): void {
  const fieldPath = resolveArrayFieldPath(pathPrefix, item.name)
  pushRelationshipBinding(item, fieldPath, pathPrefix, insideArrayItem, bindings)
  walkItems(item.fields, fieldPath, true, bindings)
}

function walkColumnsItem(
  item: ColumnsConfig,
  pathPrefix: string | undefined,
  insideArrayItem: boolean,
  bindings: RelationshipArrayBinding[],
): void {
  for (const column of item.columns) {
    walkContainerFields(column.fields, pathPrefix, insideArrayItem, bindings)
  }
}

function walkContainerItem(
  item: ContainerItem,
  pathPrefix: string | undefined,
  insideArrayItem: boolean,
  bindings: RelationshipArrayBinding[],
): void {
  if (item.kind === 'columns') {
    walkColumnsItem(item, pathPrefix, insideArrayItem, bindings)
    return
  }

  walkContainerFields(item.fields, pathPrefix, insideArrayItem, bindings)
}

function walkItems(
  items: readonly (FormItem | RowConfig)[],
  pathPrefix: string | undefined,
  insideArrayItem: boolean,
  bindings: RelationshipArrayBinding[],
): void {
  for (const item of items) {
    if (!('kind' in item) || item.kind === 'slot') continue
    if (item.kind === 'array') {
      walkArrayItem(item, pathPrefix, insideArrayItem, bindings)
      continue
    }
    if (item.kind === 'dependent') {
      walkContainerFields(item.dependents.fields, pathPrefix, insideArrayItem, bindings)
      continue
    }
    walkContainerItem(item, pathPrefix, insideArrayItem, bindings)
  }
}

/** Collects top-level relationship array bindings for schema-form picker hosting. */
export function collectRelationshipArrayBindings(
  items: readonly FormItem[],
): RelationshipArrayBinding[] {
  const bindings: RelationshipArrayBinding[] = []
  walkItems(items, undefined, false, bindings)
  return bindings
}
