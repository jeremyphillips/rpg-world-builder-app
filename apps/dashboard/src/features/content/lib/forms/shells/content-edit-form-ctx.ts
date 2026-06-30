import type { ContentFormCtx } from '../content-form-registry'

/** Reads `kind` from list-query entities that carry an equipment kind. */
export function entityEquipmentKind(entity: unknown): ContentFormCtx['equipmentKind'] | undefined {
  if (entity && typeof entity === 'object' && 'kind' in entity) {
    return (entity as { kind: ContentFormCtx['equipmentKind'] }).kind
  }
  return undefined
}

/** Merges catalog options, route form context, and resolved entity metadata for edit forms. */
export function mergeEditLayoutCtx(
  optionsCtx: ContentFormCtx,
  formCtx: Partial<ContentFormCtx> | undefined,
  campaignId: string,
  entityId: string,
  entity: { source?: ContentFormCtx['entitySource']; kind?: unknown } | undefined,
): ContentFormCtx {
  return {
    ...optionsCtx,
    ...formCtx,
    campaignId,
    entityId,
    mode: 'edit',
    entitySource: entity?.source,
    equipmentKind: formCtx?.equipmentKind ?? entityEquipmentKind(entity),
  }
}
