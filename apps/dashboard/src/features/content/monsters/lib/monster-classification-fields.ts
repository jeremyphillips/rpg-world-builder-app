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

const MONSTER_CREATURE_FAMILY_CLEAR_HEADLINE = 'Remove creature families?'
const MONSTER_CLASS_CLASSIFICATION_CLEAR_HEADLINE = 'Remove class classifications?'
const MONSTER_CREATURE_FAMILY_PLACEHOLDER = 'Choose families…'
const CLASS_CLASSIFICATION_LABEL = `${getContentTypeTerm('classes').label} classifications`

const classificationDisclosure = (actionSubject: string, clearHeadline: string) => ({
  intent: 'add' as const,
  actionSubject,
  expandWhenPopulated: true,
  confirmBeforeClear: {
    headline: clearHeadline,
    description: 'This clears the values you selected.',
    confirmLabel: 'Remove',
  },
})

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
  const familyCopy = vocabularyTermFieldCopy(CREATURE_FAMILY_TERM, { multiple: true })
  return [
    {
      kind: 'row',
      fields: [
        {
          type: 'combobox',
          name: 'creatureFamilyIds',
          multiple: true,
          width: '1/2',
          label: familyCopy.label,
          placeholder: MONSTER_CREATURE_FAMILY_PLACEHOLDER,
          optionalDisclosure: classificationDisclosure(
            'families',
            MONSTER_CREATURE_FAMILY_CLEAR_HEADLINE,
          ),
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
          width: '1/2',
          label: CLASS_CLASSIFICATION_LABEL,
          hint: {
            text: 'Classification only; does not grant levels or class features.',
            position: 'below-control',
          },
          optionalDisclosure: classificationDisclosure(
            'classifications',
            MONSTER_CLASS_CLASSIFICATION_CLEAR_HEADLINE,
          ),
          options: monsterClassFieldOptions(ctx),
          optionsResolve: {
            dependsOn: ['classIds'],
            optionsWhen: (values) =>
              monsterClassFieldOptions(ctx, values.classIds as string[] | undefined),
          },
        },
      ],
    },
  ]
}
