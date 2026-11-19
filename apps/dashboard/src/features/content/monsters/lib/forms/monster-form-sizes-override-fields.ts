import { formatCreatureSizeList, type CreatureSize } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import { buildActiveSizeFieldOptions } from '@/features/vocabulary'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  CREATURE_SIZES_FIELD_LABEL,
  createCreatureSizesFieldConfig,
} from '../../../lib/forms/fields/creature-sizes-form-fields'
import {
  MONSTER_FORM_BASE_MOVEMENT_PREVIEW_LABEL,
  MONSTER_FORM_USE_BASE_SIZES_LABEL,
} from '../monster-form-labels'

/** Defined-form row prefix is `forms.definedForms.{index}` — three hops to root `sizes`. */
const FORM_BASE_SIZES_DEPENDS = ['../../../sizes'] as const

function readBaseSizes(values: Record<string, unknown>): CreatureSize[] | undefined {
  const base = values['../../../sizes']
  return Array.isArray(base) ? (base as CreatureSize[]) : undefined
}

function baseSizesPreviewText(values: Record<string, unknown>): string | undefined {
  const ids = readBaseSizes(values)
  if (!ids?.length) return undefined
  const label = formatCreatureSizeList(ids)
  return label || undefined
}

/** Optional sizes override for a defined alternate form row (master-detail relative paths). */
export function monsterFormSizesOverrideGroup(ctx: ContentFormCtx): FormItem {
  const sizesField = {
    ...createCreatureSizesFieldConfig({
      options: buildActiveSizeFieldOptions(ctx.sizeVocabulary, ctx.creatureSizesSeedIds),
    }),
    name: 'overrides.sizes',
    required: false,
    labelVisibility: 'srOnly' as const,
  }

  return {
    kind: 'group',
    name: 'sizesOverride',
    heading: { label: CREATURE_SIZES_FIELD_LABEL },
    headingScale: 'field',
    optionalDisclosure: {
      intent: 'override',
      removeLabel: MONSTER_FORM_USE_BASE_SIZES_LABEL,
      expandWhenPopulated: true,
      labeled: true,
      watchPaths: ['overrides.sizes'],
      clearPaths: ['overrides.sizes'],
      summary: {
        dependsOn: [...FORM_BASE_SIZES_DEPENDS],
        resolve: (values) => {
          const text = baseSizesPreviewText(values)
          return text ? `Inherits: ${text}` : 'Inherits base sizes.'
        },
      },
      sourcePreview: {
        dependsOn: [...FORM_BASE_SIZES_DEPENDS],
        resolve: (values) => {
          const text = baseSizesPreviewText(values)
          if (!text) return undefined
          return { label: MONSTER_FORM_BASE_MOVEMENT_PREVIEW_LABEL, text }
        },
      },
    },
    fields: [sizesField],
  }
}
