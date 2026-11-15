import {
  CONDITION_TERM,
  formatDamageValue,
  planLinkedEffectAdd,
  type ResolutionApplicationAmount,
} from '@rpg/contracts'
import type { ArrayConfig, FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../forms/registry/content-form-registry'
import { applicationAmountField } from './application-row-fields'
import { damageDefinitionFields } from './damage-definition-fields'
import { EFFECT_ADD_LABEL, EFFECT_DAMAGE_LABEL, EFFECT_NOTE_LABEL } from './effect-authoring-copy'
import { orderedEffectRowFields } from './ordered-effect-row-fields'
import { ResolutionEffectDefinitionSlot } from './resolution-effect-definition-slot'
import { vocabularyFieldLabel } from '@/features/vocabulary'

type ReferenceRole =
  | {
      role: 'owner'
      linked: readonly { path: string; amount: ResolutionApplicationAmount }[]
    }
  | { role: 'linked'; amounts: readonly ResolutionApplicationAmount[] }
  | { role: 'none' }

function effectIds(library: unknown): string[] {
  if (!Array.isArray(library)) return []
  return library.flatMap((entry) =>
    entry && typeof entry === 'object' && typeof (entry as { id?: unknown }).id === 'string'
      ? [(entry as { id: string }).id]
      : [],
  )
}

function damageSummary(effectId: unknown, library: unknown): string {
  if (typeof effectId !== 'string' || !Array.isArray(library)) return EFFECT_DAMAGE_LABEL
  const effect = library.find(
    (entry) => entry && typeof entry === 'object' && (entry as { id?: unknown }).id === effectId,
  ) as
    | { roll?: { dice?: { count: number; faces: number }; flat?: number }; damageType?: string }
    | undefined
  if (!effect?.roll || !effect.damageType) return EFFECT_DAMAGE_LABEL
  return formatDamageValue(effect.roll, effect.damageType)
}

function rowPath(slotPath: string): string {
  const marker = '._definition'
  return slotPath.endsWith(marker) ? slotPath.slice(0, -marker.length) : slotPath
}

/** Outcome effect list. Owner rows edit definitions; linked rows only choose an amount. */
export function resolutionOutcomeEffectsArray(options: {
  ctx: ContentFormCtx
  name: string
  listPath: string
  libraryPath: string
  inlineKinds: readonly ('condition' | 'note')[]
  references: ReferenceRole
  precedingEffectsPath?: string
}): ArrayConfig {
  const { references } = options
  const damageMenu =
    references.role === 'owner'
      ? [
          {
            id: 'damage',
            label: EFFECT_DAMAGE_LABEL,
            select: (ctx: {
              getValues: (path: string) => unknown
              append: (path: string, row: Record<string, unknown>) => void
            }) => {
              const plan = planLinkedEffectAdd({
                existingIds: effectIds(ctx.getValues(options.libraryPath)),
                definition: { kind: 'damage', roll: { dice: { count: 1, faces: 6 } } },
                owner: { result: 'failed-save' as const, amount: 'full' as const },
                linked: references.linked.map((link) => ({
                  result: 'successful-save' as const,
                  amount: link.amount,
                })),
              })
              ctx.append(options.libraryPath, plan.definition)
              references.linked.forEach((link, index) => {
                const reference = plan.references[index + 1]?.reference
                if (reference) ctx.append(link.path, reference)
              })
              return plan.references[0]?.reference
            },
          },
        ]
      : []

  const fields: FormItem[] = [
    ...(references.role === 'owner'
      ? [
          {
            kind: 'slot' as const,
            name: '_definition',
            visibility: {
              dependsOn: ['kind'],
              visibleWhen: (values: Record<string, unknown>) => values.kind === 'effect-reference',
            },
            render: ({ path }: { path: string }) => (
              <ResolutionEffectDefinitionSlot
                path={rowPath(path)}
                libraryPath={options.libraryPath}
                fields={damageDefinitionFields({ ctx: options.ctx })}
              />
            ),
          },
        ]
      : []),
    ...(references.role === 'linked'
      ? [
          {
            ...applicationAmountField(references.amounts),
            visibility: {
              dependsOn: ['kind'],
              visibleWhen: (values: Record<string, unknown>) => values.kind === 'effect-reference',
            },
          },
        ]
      : []),
    ...orderedEffectRowFields({
      ctx: options.ctx,
      kinds: options.inlineKinds,
      precedingEffectsPath: options.precedingEffectsPath,
    }),
  ]

  return {
    kind: 'array',
    name: options.name,
    addAction: {
      label: EFFECT_ADD_LABEL,
      menu: {
        groups: [],
        enableSearch: false,
        items: [
          ...damageMenu,
          ...(options.inlineKinds.includes('condition')
            ? [
                {
                  id: 'condition',
                  label: vocabularyFieldLabel(CONDITION_TERM),
                  appendDefaults: { kind: 'condition' },
                },
              ]
            : []),
          ...(options.inlineKinds.includes('note')
            ? [{ id: 'note', label: EFFECT_NOTE_LABEL, appendDefaults: { kind: 'note' } }]
            : []),
        ],
      },
    },
    item: {
      collapsible: true,
      resolveCollapsible: (values) =>
        references.role === 'linked' ? values.kind !== 'effect-reference' : true,
      removable: references.role === 'linked' ? (row) => row.kind !== 'effect-reference' : true,
      remove:
        references.role === 'owner'
          ? (ctx) => {
              const row = ctx.row as { kind?: string; effectId?: string }
              ctx.removeAt(options.listPath, ctx.index)
              if (row.kind !== 'effect-reference' || !row.effectId) return
              for (const link of references.linked) {
                const rows = ctx.getValues(link.path)
                if (!Array.isArray(rows)) continue
                for (let index = rows.length - 1; index >= 0; index -= 1) {
                  const entry = rows[index]
                  if (
                    entry &&
                    typeof entry === 'object' &&
                    (entry as { effectId?: string }).effectId === row.effectId
                  ) {
                    ctx.removeAt(link.path, index)
                  }
                }
              }
            }
          : undefined,
      header: {
        fallback: () => EFFECT_DAMAGE_LABEL,
        primary: (values) => {
          if (values.kind === 'effect-reference') return EFFECT_DAMAGE_LABEL
          if (values.kind === 'note') return EFFECT_NOTE_LABEL
          return vocabularyFieldLabel(CONDITION_TERM)
        },
        summary: (values, _index, watched) => {
          if (values.kind !== 'effect-reference') return ''
          return damageSummary(values.effectId, watched?.[options.libraryPath])
        },
        summaryDependsOn: [options.libraryPath],
      },
    },
    fields,
  }
}
