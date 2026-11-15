import { getDamageTypeLabel } from '@rpg/contracts'
import { ButtonDropdown, Icon, Text } from '@rpg/ui'
import {
  FormItems,
  getArrayFieldMutators,
  useArrayFieldContext,
  type ArrayConfig,
  type FormItem,
} from '@rpg/ui/form'
import { useFormContext, useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { damageFieldGroup } from '../../../lib/forms/mechanics/damage-field-group'
import { orderedEffectItemFields } from '../../../lib/forms/mechanics/ordered-effect-form-fields'
import { vocabularyFieldLabel } from '@/features/vocabulary'
import { CONDITION_TERM } from '@rpg/contracts'
import {
  MONSTER_ACTION_DAMAGE_FIELD_LABEL,
  MONSTER_ON_HIT_ADD_LABEL,
  MONSTER_ON_HIT_NOTE_LABEL,
  MONSTER_SAVE_DELETE_UNUSED_EFFECT_LABEL,
  MONSTER_SAVE_EFFECT_AMOUNT_LABEL,
  MONSTER_SAVE_SHARED_EFFECT_LABEL,
  MONSTER_SAVE_USE_EXISTING_EFFECT_LABEL,
} from '../monster-form-labels'
import {
  countMonsterSaveEffectReferences,
  createMonsterSaveDamageDefinition,
  eligibleExistingSaveEffects,
  isUnusedSaveEffect,
  nextMonsterSaveDamageEffectId,
  readMonsterSaveOutcomes,
  readResolutionEffects,
  stripMonsterSaveEffectReferences,
  type MonsterSaveOutcome,
} from './monster-action-save-outcomes'

const WRITE_OPTIONS = { shouldDirty: true, shouldTouch: true, shouldValidate: true } as const

const AMOUNT_OPTIONS = [
  { value: 'full', label: 'Full' },
  { value: 'half', label: 'Half' },
]

function outcomesPath(namePrefix: string): string {
  return namePrefix ? `${namePrefix}.resolution.outcomes` : 'resolution.outcomes'
}

function libraryPath(namePrefix: string): string {
  return namePrefix ? `${namePrefix}.resolution.effects` : 'resolution.effects'
}

function listPath(namePrefix: string, arrayName: string): string {
  return namePrefix ? `${namePrefix}.${arrayName}` : arrayName
}

function SaveEffectReferenceSlot({
  ctx,
  namePrefix,
  arrayName,
}: {
  ctx: ContentFormCtx
  namePrefix: string
  arrayName: string
}) {
  const array = useArrayFieldContext()
  const row = array?.items[array.rowIndex]
  const effectId =
    row && typeof row === 'object' && 'effectId' in row && typeof row.effectId === 'string'
      ? row.effectId
      : ''
  const rowPath = array?.fullArrayName
    ? `${array.fullArrayName}.${array.rowIndex}`
    : `${listPath(namePrefix, arrayName)}.${array?.rowIndex ?? 0}`

  return (
    <SaveEffectReferenceRow
      ctx={ctx}
      namePrefix={namePrefix}
      effectId={effectId}
      rowPath={rowPath}
    />
  )
}

function SaveEffectReferenceRow({
  ctx,
  namePrefix,
  effectId,
  rowPath,
}: {
  ctx: ContentFormCtx
  namePrefix: string
  effectId: string
  rowPath: string
}) {
  const library = readResolutionEffects(useWatch({ name: libraryPath(namePrefix) }))
  const outcomes = readMonsterSaveOutcomes(useWatch({ name: outcomesPath(namePrefix) }))
  const effectIndex = library.findIndex((effect) => effect.id === effectId)
  const effect = effectIndex >= 0 ? library[effectIndex] : undefined
  const shared = countMonsterSaveEffectReferences(outcomes, effectId) > 1
  const damage = effect?.kind === 'damage'

  return (
    <div className="flex flex-col gap-3">
      {shared ? <Text variant="supporting">{MONSTER_SAVE_SHARED_EFFECT_LABEL}</Text> : null}
      {effect && damage ? (
        <FormItems
          idPrefix={`${rowPath}-definition`}
          namePrefix={`${libraryPath(namePrefix)}.${effectIndex}`}
          items={[
            damageFieldGroup({
              ctx,
              damageTypeName: 'damageType',
              rollName: 'roll',
              legendVisibility: 'srOnly',
            }),
          ]}
        />
      ) : effect ? (
        <Text variant="supporting">{effect.kind}</Text>
      ) : (
        <Text variant="supporting">{effectId}</Text>
      )}
      {damage ? (
        <FormItems
          idPrefix={`${rowPath}-amount`}
          namePrefix={rowPath}
          items={[
            {
              type: 'select',
              name: 'amount',
              label: MONSTER_SAVE_EFFECT_AMOUNT_LABEL,
              options: AMOUNT_OPTIONS,
            },
          ]}
        />
      ) : null}
    </div>
  )
}

function effectMenuLabel(effect: { id?: string; kind?: string; damageType?: string }): string {
  if (effect.kind === 'damage' && typeof effect.damageType === 'string') {
    return `${MONSTER_ACTION_DAMAGE_FIELD_LABEL} · ${getDamageTypeLabel(effect.damageType)}`
  }
  return effect.kind ?? effect.id ?? 'Effect'
}

export function MonsterActionSaveOutcomeAddMenu({
  namePrefix,
  arrayName,
}: {
  namePrefix: string
  arrayName: string
}) {
  const { control, setValue } = useFormContext()
  const list = listPath(namePrefix, arrayName)
  const library = useWatch({ name: libraryPath(namePrefix) })
  const listEffects = useWatch({ name: list })
  const outcomes = readMonsterSaveOutcomes(useWatch({ name: outcomesPath(namePrefix) }))
  const existing = eligibleExistingSaveEffects(library, listEffects)

  const items = [
    { id: 'damage', label: MONSTER_ACTION_DAMAGE_FIELD_LABEL },
    { id: 'condition', label: vocabularyFieldLabel(CONDITION_TERM) },
    { id: 'note', label: MONSTER_ON_HIT_NOTE_LABEL },
    ...existing.flatMap((effect) => {
      const id = effect.id
      if (!id) return []
      const label = effectMenuLabel(effect)
      const useItem = {
        id: `use:${id}`,
        label: `${MONSTER_SAVE_USE_EXISTING_EFFECT_LABEL}: ${label}`,
      }
      if (!isUnusedSaveEffect(id, outcomes)) return [useItem]
      return [
        useItem,
        { id: `delete:${id}`, label: `${MONSTER_SAVE_DELETE_UNUSED_EFFECT_LABEL}: ${label}` },
      ]
    }),
  ]

  const appendEffect = (entry: Record<string, unknown>) => {
    const mutators = getArrayFieldMutators(control, list)
    if (mutators) {
      mutators.append(entry)
      return
    }
    const current = Array.isArray(listEffects) ? listEffects : []
    setValue(list, [...current, entry], WRITE_OPTIONS)
  }

  return (
    <ButtonDropdown
      label={MONSTER_ON_HIT_ADD_LABEL}
      leadingIcon={<Icon name="plus" size="owner" />}
      groups={[]}
      items={items}
      enableSearch={false}
      variant="outline"
      width="full"
      onSelectItem={(id) => {
        if (id === 'damage') {
          const effectId = nextMonsterSaveDamageEffectId(library)
          setValue(
            libraryPath(namePrefix),
            [...readResolutionEffects(library), createMonsterSaveDamageDefinition(effectId)],
            WRITE_OPTIONS,
          )
          appendEffect({ kind: 'effect-reference', effectId, amount: 'full' })
          return
        }
        if (id === 'condition') {
          appendEffect({ kind: 'condition' })
          return
        }
        if (id === 'note') {
          appendEffect({ kind: 'note' })
          return
        }
        if (id.startsWith('use:')) {
          appendEffect({ kind: 'effect-reference', effectId: id.slice(4), amount: 'full' })
          return
        }
        if (id.startsWith('delete:')) {
          const effectId = id.slice(7)
          setValue(
            libraryPath(namePrefix),
            readResolutionEffects(library).filter((effect) => effect.id !== effectId),
            WRITE_OPTIONS,
          )
          setValue(
            outcomesPath(namePrefix),
            stripMonsterSaveEffectReferences(outcomes, effectId) as MonsterSaveOutcome[],
            WRITE_OPTIONS,
          )
        }
      }}
    />
  )
}

export function monsterSaveOutcomeEffectsArray(options: {
  ctx: ContentFormCtx
  namePrefix: string
  arrayName: string
  precedingEffectsPath?: string
}): ArrayConfig {
  return {
    kind: 'array',
    name: options.arrayName,
    heading: { label: 'Effects', labelVisibility: 'srOnly' },
    addAction: false,
    item: {
      collapsible: true,
      header: {
        fallback: (index) => `Effect ${index + 1}`,
        primary: (values) => {
          if (values.kind === 'effect-reference') return MONSTER_ACTION_DAMAGE_FIELD_LABEL
          if (values.kind === 'condition') return vocabularyFieldLabel(CONDITION_TERM)
          if (values.kind === 'note') return MONSTER_ON_HIT_NOTE_LABEL
          return 'Effect'
        },
      },
    },
    fields: [
      {
        kind: 'slot',
        name: '_effectReference',
        visibility: {
          dependsOn: ['kind'],
          visibleWhen: (values) => values.kind === 'effect-reference',
        },
        render: () => (
          <SaveEffectReferenceSlot
            ctx={options.ctx}
            namePrefix={options.namePrefix}
            arrayName={options.arrayName}
          />
        ),
      },
      ...orderedEffectItemFields({
        ctx: options.ctx,
        kind: 'condition',
        precedingEffectsPath: options.precedingEffectsPath,
      }),
      ...orderedEffectItemFields({
        ctx: options.ctx,
        kind: 'note',
      }),
    ],
  }
}

export function monsterSaveOutcomeEffectsFields(options: {
  ctx: ContentFormCtx
  namePrefix: string
  arrayName: string
  precedingEffectsPath?: string
}): FormItem[] {
  return [
    monsterSaveOutcomeEffectsArray(options),
    {
      kind: 'slot',
      name: `_saveAdd-${options.arrayName}`,
      render: () => (
        <MonsterActionSaveOutcomeAddMenu
          namePrefix={options.namePrefix}
          arrayName={options.arrayName}
        />
      ),
    },
  ]
}
