import {
  CREATURE_FAMILY_TERM,
  getContentTypeTerm,
  isCreatureFamilyCompatible,
  formatMonsterClassificationReference,
  MONSTER_CLASSIFICATION_DISABLED,
  MONSTER_CLASSIFICATION_DRAFT,
  unionPersistedOptions,
  vocabularyTermFieldCopy,
} from '@rpg/contracts'
import type { FormItem, FieldOption } from '@rpg/ui/form'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'

export function monsterFamilyFieldOptions(
  ctx: ContentFormCtx,
  creatureType?: string,
  selectedIds: readonly string[] = [],
): FieldOption[] {
  const vocabulary = ctx.creatureFamilyVocabulary
  const options = [...(vocabulary?.byId.values() ?? [])]
    .filter((row) => row.status === 'active' && isCreatureFamilyCompatible(row, creatureType))
    .map((row) => ({ value: row.id, label: row.label }))
  const authorizedDisplay = new Map(
    [...(vocabulary?.byId.values() ?? [])].map((row) => [
      row.id,
      {
        label: formatMonsterClassificationReference(
          row.id,
          row.label,
          row.status !== 'active'
            ? MONSTER_CLASSIFICATION_DISABLED
            : !isCreatureFamilyCompatible(row, creatureType)
              ? 'Incompatible creature type'
              : undefined,
        ),
      },
    ]),
  )
  return unionPersistedOptions({
    selectable: options,
    persistedIds: selectedIds,
    authorizedDisplay,
    formatUnresolvedLabel: (id) => formatMonsterClassificationReference(id),
  })
}

export function monsterClassFieldOptions(
  ctx: ContentFormCtx,
  selectedIds: readonly string[] = [],
): FieldOption[] {
  const classes = ctx.options?.classes?.visible ?? []
  return unionPersistedOptions({
    selectable: (ctx.options?.classes?.forReference() ?? []).map((row) => ({
      value: row.id,
      label: row.name,
    })),
    persistedIds: selectedIds,
    authorizedDisplay: new Map(
      classes.map((row) => [
        row.id,
        {
          label: formatMonsterClassificationReference(
            row.id,
            row.name,
            row.status === 'draft' ? MONSTER_CLASSIFICATION_DRAFT : undefined,
          ),
        },
      ]),
    ),
    formatUnresolvedLabel: (id) => formatMonsterClassificationReference(id),
  })
}

export function monsterClassificationFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      type: 'combobox',
      name: 'creatureFamilyIds',
      multiple: true,
      ...vocabularyTermFieldCopy(CREATURE_FAMILY_TERM, { multiple: true }),
      options: monsterFamilyFieldOptions(ctx),
      optionsResolve: {
        dependsOn: ['creatureType', 'creatureFamilyIds'],
        optionsWhen: (values) =>
          monsterFamilyFieldOptions(
            ctx,
            values.creatureType as string | undefined,
            values.creatureFamilyIds as string[] | undefined,
          ),
      },
    },
    {
      type: 'combobox',
      name: 'classIds',
      multiple: true,
      label: `${getContentTypeTerm('classes').label} classifications`,
      hint: {
        text: 'Classification only; does not grant levels or class features.',
        position: 'below-control',
      },
      options: monsterClassFieldOptions(ctx),
      optionsResolve: {
        dependsOn: ['classIds'],
        optionsWhen: (values) =>
          monsterClassFieldOptions(ctx, values.classIds as string[] | undefined),
      },
    },
  ]
}
