import { resolveMonsterActionIdentity, type ResolvedMonsterActionIdentity } from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { monsterEquipmentCatalog, monsterMagicPropertyProvider } from '../monster-form-derivation'
import type { MonsterFormValues } from '../monster-form-values'
import type { MonsterActionDraftRow } from './monster-action-presets'

export function resolveMonsterFormActionIdentity(
  action: MonsterActionDraftRow,
  values: MonsterFormValues | undefined,
  ctx: ContentFormCtx,
): ResolvedMonsterActionIdentity {
  return resolveMonsterActionIdentity({
    action,
    equipment: values?.equipment,
    equipmentCatalog: monsterEquipmentCatalog(ctx),
    magicPropertyProvider: monsterMagicPropertyProvider(ctx),
    equipmentCatalogStatus: ctx.equipmentCatalogStatus ?? 'pending',
  })
}
