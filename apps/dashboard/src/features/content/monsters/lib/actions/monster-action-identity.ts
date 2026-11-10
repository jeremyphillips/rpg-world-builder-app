import { resolveMonsterActionIdentity, type ResolvedMonsterActionIdentity } from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { masterDetailItemTitle } from '../../../lib/master-detail/master-detail-constants'
import { monsterEquipmentCatalog, monsterMagicPropertyProvider } from '../monster-form-derivation'
import { MONSTER_ACTION_ITEM_NOUN } from '../monster-form-labels'
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

/** List and header title. Blank derived or authored names use the shared unnamed title. */
export function monsterActionNavigationTitle(identity: ResolvedMonsterActionIdentity): string {
  return identity.displayName.trim() || masterDetailItemTitle(undefined, MONSTER_ACTION_ITEM_NOUN)
}
