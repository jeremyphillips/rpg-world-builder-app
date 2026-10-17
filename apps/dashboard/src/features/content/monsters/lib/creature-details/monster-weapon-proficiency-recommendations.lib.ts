import type { FieldRecommendationGroup } from '@rpg/ui'
import type { FieldOption, FieldRecommendationResolveContext } from '@rpg/ui/form'

import {
  creatureWeaponProficienciesSchema,
  creatureWeaponProficiencyTargetsFromGrantSet,
} from '@rpg/contracts'

import { buildWeaponProficiencyRecommendationGroup } from '@/lib/forms/grant-sets/weapon-proficiency-field-recommendation.lib'
import { resolveWeaponProficiencyMissingRecommendations } from '@/lib/forms/grant-sets/prepare-weapon-proficiency-combobox-options.lib'
import { weaponProficiencyGrantSetFromMode } from '@/lib/forms/grant-sets/weapon-proficiency-grant-mode.lib'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  formatMonsterWeaponProficiencyBulkAddAriaLabel,
  MONSTER_WEAPON_OWNED_PROFICIENCY_RECOMMENDATIONS_SOURCE,
  MONSTER_WEAPON_PROFICIENCY_RECOMMENDATION_ADD_LABEL,
} from '../monster-form-labels'
import type { MonsterFormValues } from '../monster-form-values'
import { MONSTER_DEFAULT_WEAPON_PROFICIENCY_MODE } from './monster-weapon-proficiencies-form.lib'

function appendWeaponProficiencyGrant(
  form: FieldRecommendationResolveContext,
  grantId: string,
): void {
  const items = (form.getValues('proficiencies.weapons.items') as string[] | undefined) ?? []
  if (items.includes(grantId)) return
  form.setValue('proficiencies.weapons.items', [...items, grantId], {
    shouldDirty: true,
    shouldValidate: true,
  })
}

function appendAllWeaponProficiencyGrants(
  form: FieldRecommendationResolveContext,
  grantIds: readonly string[],
): void {
  const items = (form.getValues('proficiencies.weapons.items') as string[] | undefined) ?? []
  const next = [...items]
  for (const grantId of grantIds) {
    if (!next.includes(grantId)) next.push(grantId)
  }
  form.setValue('proficiencies.weapons.items', next, {
    shouldDirty: true,
    shouldValidate: true,
  })
}

/** Owned weapons missing specific proficiency — field recommendation group for Weapon choices. */
export function resolveMonsterWeaponProficiencyRecommendationGroup(
  values: MonsterFormValues,
  ctx: ContentFormCtx,
  itemOptions: readonly FieldOption[],
  form: FieldRecommendationResolveContext,
): FieldRecommendationGroup | null {
  if (!values.proficiencies) return null

  const mode = values.weaponProficiencyMode ?? MONSTER_DEFAULT_WEAPON_PROFICIENCY_MODE
  if (mode !== 'specific') return null

  const buckets = values.proficiencies.weapons ?? { categories: [], items: [] }
  const grant = creatureWeaponProficienciesSchema.parse(
    weaponProficiencyGrantSetFromMode(mode, buckets),
  )
  const catalog = ctx.equipmentCatalogById ? [...ctx.equipmentCatalogById.values()] : []
  const candidates = resolveWeaponProficiencyMissingRecommendations({
    options: itemOptions,
    equipmentCatalog: catalog,
    targets: creatureWeaponProficiencyTargetsFromGrantSet(grant),
    inventory: (values.equipment ?? []).map((entry) => ({
      equipmentId: entry.equipmentId,
      quantity: entry.quantity ?? 1,
      equipped: entry.equipped === true,
    })),
    selectedIds: new Set(grant.items),
  })

  return buildWeaponProficiencyRecommendationGroup({
    candidates,
    sourceLabel: MONSTER_WEAPON_OWNED_PROFICIENCY_RECOMMENDATIONS_SOURCE,
    addActionLabel: MONSTER_WEAPON_PROFICIENCY_RECOMMENDATION_ADD_LABEL,
    formatBulkAddAriaLabel: formatMonsterWeaponProficiencyBulkAddAriaLabel,
    onAddGrant: (grantId) => appendWeaponProficiencyGrant(form, grantId),
    onAddAllGrants: (grantIds) => appendAllWeaponProficiencyGrants(form, grantIds),
  })
}
