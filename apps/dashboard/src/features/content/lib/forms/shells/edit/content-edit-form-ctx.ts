import type { ContentFormCtx } from '../../registry/content-form-registry'

/** Reads `kind` from list-query entities that carry an equipment kind. */
export function entityEquipmentKind(entity: unknown): ContentFormCtx['equipmentKind'] | undefined {
  if (entity && typeof entity === 'object' && 'kind' in entity) {
    return (entity as { kind: ContentFormCtx['equipmentKind'] }).kind
  }
  return undefined
}

/**
 * Merges catalog options, route form context, and resolved entity metadata for edit forms.
 * `rulesetId` stays the campaign catalog ruleset from `optionsCtx`. Entity ruleset is
 * exposed separately for artwork and entity-facing display (`entityRulesetId`).
 */
export function mergeEditLayoutCtx(
  optionsCtx: ContentFormCtx,
  formCtx: Partial<ContentFormCtx> | undefined,
  campaignId: string,
  entityId: string,
  entity:
    | {
        catalogLayer?: ContentFormCtx['entityCatalogLayer']
        kind?: unknown
        rulesetId?: string
        slug?: string
      }
    | undefined,
): ContentFormCtx {
  return {
    ...optionsCtx,
    ...formCtx,
    campaignId,
    entityId,
    mode: 'edit',
    entityCatalogLayer: entity?.catalogLayer,
    entitySlug: entity?.slug,
    rulesetId: optionsCtx.rulesetId,
    entityRulesetId: entity?.rulesetId,
    equipmentKind: formCtx?.equipmentKind ?? entityEquipmentKind(entity),
  }
}
